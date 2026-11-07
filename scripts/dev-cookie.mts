// Signs a development member in, headlessly, and prints a curl cookie jar for
// the API (0.5.11). From the umbrella, which supplies the member's
// credentials and the proxy's certificate authority:
//
//   just dev-cookie coach@sadara.test > jar
//
// The API's two legs — the sign-in's start and its callback — are requested
// from here, over the proxy's HTTPS, verified against its certificate
// authority (NODE_EXTRA_CA_CERTS): no certificate check is turned off. Only
// Keycloak's pages, on http://localhost, are a browser's: Playwright fills
// them in, and the callback Keycloak sends the browser to is caught there and
// requested from here. A privileged member is sent back for the second factor
// (0.5.8), which the authenticator secret answers.
//
// The password and the secret come from the environment
// (SADARA_DEV_MEMBER_PASSWORD, SADARA_DEV_OTP_SECRET) and are never printed,
// nor is a code. What it prints is a session: keep the jar to yourself.

import { createHmac } from 'node:crypto';
import type { LookupAddress } from 'node:dns';
import { request } from 'node:https';
import { type Browser, chromium, type Page } from '@playwright/test';

const SESSION_COOKIE = '__Host-Http-sadara_session';
const CALLBACK_PATH = '/api/v1/auth/callback';
// A development member: <role>@<tenant>.test, whose tenant is served at
// https://<tenant>.localhost (infra/keycloak/README.md).
const MEMBER = /^[a-z0-9-]+@([a-z0-9-]+)\.test$/;

class Refused extends Error {}

interface Cookie {
  value: string;
  expires: number; // seconds since the epoch; 0 for the browser's session
}

interface Answer {
  status: number;
  location: URL | null;
}

/**
 * *.localhost is this machine (RFC 6761). It is resolved here, to the
 * address the proxy listens on, whatever the system's resolver makes of it.
 */
function loopback(
  _host: string,
  options: { all?: boolean },
  callback: (
    error: NodeJS.ErrnoException | null,
    address: string | LookupAddress[],
    family?: number,
  ) => void,
): void {
  if (options.all) callback(null, [{ address: '127.0.0.1', family: 4 }]);
  else callback(null, '127.0.0.1', 4);
}

/** Keeps a Set-Cookie header's cookie, or forgets it if it has expired. */
function keep(jar: Map<string, Cookie>, header: string): void {
  const [pair, ...attributes] = header.split(';').map((part) => part.trim());
  const equals = pair.indexOf('=');
  if (equals < 1) return;
  const name = pair.slice(0, equals);
  let expires = 0;
  for (const attribute of attributes) {
    const [key, value = ''] = attribute.split('=');
    if (key.toLowerCase() === 'max-age') {
      expires = Math.floor(Date.now() / 1000) + Number(value);
    } else if (key.toLowerCase() === 'expires' && expires === 0) {
      expires = Math.floor(Date.parse(value) / 1000);
    }
  }
  if (expires !== 0 && expires <= Date.now() / 1000) jar.delete(name);
  else jar.set(name, { value: pair.slice(equals + 1), expires });
}

/** One GET to the API with the jar's cookies, keeping what it sets; redirects are not followed. */
function get(url: URL, jar: Map<string, Cookie>): Promise<Answer> {
  const cookie = [...jar].map(([name, { value }]) => `${name}=${value}`);
  return new Promise((resolve, reject) => {
    const outgoing = request(
      url,
      {
        method: 'GET',
        lookup: loopback,
        timeout: 30_000,
        headers: cookie.length > 0 ? { cookie: cookie.join('; ') } : {},
      },
      (incoming) => {
        for (const header of incoming.headers['set-cookie'] ?? []) {
          keep(jar, header);
        }
        incoming.resume();
        incoming.on('end', () =>
          resolve({
            status: incoming.statusCode ?? 0,
            location: incoming.headers.location
              ? new URL(incoming.headers.location, url)
              : null,
          }),
        );
      },
    );
    outgoing.on('timeout', () =>
      outgoing.destroy(new Refused(`${url.origin} did not answer`)),
    );
    outgoing.on('error', reject);
    outgoing.end();
  });
}

/** RFC 6238 as Keycloak computes it: HMAC-SHA1 over the secret's UTF-8 bytes, 30 s, six digits. */
function totp(secret: string, at: number): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(at / 30_000)));
  const digest = createHmac('sha1', Buffer.from(secret, 'utf8'))
    .update(counter)
    .digest();
  const offset = digest[digest.length - 1] & 15;
  return String(
    (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000,
  ).padStart(6, '0');
}

/** Submits Keycloak's form and waits for the page it leads to. */
async function submit(page: Page): Promise<void> {
  await Promise.all([page.waitForEvent('load'), page.click('#kc-login')]);
}

/**
 * Answers Keycloak's forms in the browser — the password, then a second
 * factor if one is asked for — until it sends the browser to the API's
 * callback, and returns that callback's address.
 */
async function atProvider(
  page: Page,
  from: URL,
  member: string,
  credentials: { password: string; otpSecret: string },
  caught: () => URL | null,
): Promise<URL> {
  await page.goto(from.href);
  let passwordGiven = false;
  let codesGiven = 0;
  for (let step = 0; step < 6; step += 1) {
    const callback = caught();
    if (callback) return callback;
    if ((await page.locator('#otp').count()) > 0) {
      // A code is good once: after a refusal, the next window's.
      if (codesGiven === 2)
        throw new Refused('Keycloak refused the second factor twice');
      if (codesGiven === 1) {
        const nextWindow = 30_000 - (Date.now() % 30_000) + 1_000;
        await new Promise((resolve) => setTimeout(resolve, nextWindow));
      }
      await page.fill('#otp', totp(credentials.otpSecret, Date.now()));
      codesGiven += 1;
      await submit(page);
    } else if ((await page.locator('#password').count()) > 0) {
      if (passwordGiven) {
        throw new Refused(
          `Keycloak refused ${member}'s password: is infra/.env's the realm's? (just realm-reset)`,
        );
      }
      if ((await page.locator('#username').count()) > 0) {
        await page.fill('#username', member);
      }
      await page.fill('#password', credentials.password);
      passwordGiven = true;
      await submit(page);
    } else {
      throw new Refused(
        `Keycloak showed a page this script does not answer: ${new URL(page.url()).origin}${new URL(page.url()).pathname}`,
      );
    }
  }
  throw new Refused('Keycloak did not send the browser back to the API');
}

/** The jar, in the Netscape format curl reads (`curl -b jar`). */
function netscape(host: string, jar: Map<string, Cookie>): string {
  const lines = [
    '# Netscape HTTP Cookie File',
    `# A development member's session at https://${host} (just dev-cookie): a credential — keep it to yourself.`,
  ];
  for (const [name, { value, expires }] of jar) {
    // The API's cookies are HttpOnly, Secure, host-only and on /.
    lines.push(
      [`#HttpOnly_${host}`, 'FALSE', '/', 'TRUE', expires, name, value].join(
        '\t',
      ),
    );
  }
  return `${lines.join('\n')}\n`;
}

async function main(argv: readonly string[]): Promise<string> {
  const [member, ...rest] = argv;
  const tenant = MEMBER.exec(member ?? '')?.[1];
  if (!tenant || rest.length > 0) {
    throw new Refused(
      'usage: just dev-cookie <role>@<tenant>.test   (a development member: infra/keycloak/README.md)',
    );
  }
  const password = process.env.SADARA_DEV_MEMBER_PASSWORD ?? '';
  const otpSecret = process.env.SADARA_DEV_OTP_SECRET ?? '';
  if (!password || !otpSecret) {
    throw new Refused(
      'SADARA_DEV_MEMBER_PASSWORD and SADARA_DEV_OTP_SECRET are not set: run it as just dev-cookie, from the umbrella',
    );
  }
  const host = `${tenant}.localhost`;
  const origin = `https://${host}`;
  const jar = new Map<string, Cookie>();

  let answer = await get(new URL('/api/v1/auth/login', origin), jar);
  let browser: Browser | undefined;
  try {
    let page: Page | undefined;
    let callback: URL | null = null;
    // A sign-in, and for a privileged member the second factor's round after
    // it, in one browser: Keycloak's own session carries from one to the next.
    for (let round = 0; round < 3; round += 1) {
      const to = answer.location;
      if (answer.status !== 303 || !to) {
        throw new Refused(
          `the API answered ${answer.status}: is it running, and the member seeded? (just seed)`,
        );
      }
      // Back at the web app: signed in.
      if (to.origin === origin) break;
      if (!page) {
        browser = await chromium.launch();
        const context = await browser.newContext();
        page = await context.newPage();
        // The callback is caught in the browser, never loaded there, since the
        // API would take its attempt from a browser holding none of this
        // sign-in's cookies: its code is redeemed from here. Chromium's Fetch
        // interception pauses it wherever it comes from, a redirect included
        // (Playwright's route() sees only a redirect chain's first request).
        const devtools = await context.newCDPSession(page);
        devtools.on('Fetch.requestPaused', (paused) => {
          callback = new URL(paused.request.url);
          void devtools.send('Fetch.fulfillRequest', {
            requestId: paused.requestId,
            responseCode: 200,
            body: '',
          });
        });
        await devtools.send('Fetch.enable', {
          patterns: [
            {
              urlPattern: `${origin}${CALLBACK_PATH}?*`,
              requestStage: 'Request',
            },
          ],
        });
      }
      callback = null;
      const reached = await atProvider(
        page,
        to,
        member,
        { password, otpSecret },
        () => callback,
      );
      answer = await get(reached, jar);
    }
  } finally {
    await browser?.close();
  }
  const session = jar.get(SESSION_COOKIE);
  if (!session) {
    throw new Refused(
      'signed in at Keycloak, but the API made no session: is the member seeded? (just seed)',
    );
  }
  return netscape(host, new Map([[SESSION_COOKIE, session]]));
}

main(process.argv.slice(2)).then(
  (jar) => process.stdout.write(jar),
  (error: unknown) => {
    // A refusal says why; anything else only its kind — never a value.
    const why =
      error instanceof Refused
        ? error.message
        : `${error instanceof Error ? error.name : 'unknown'}: the sign-in failed`;
    process.stderr.write(`dev-cookie: ${why}\n`);
    process.exitCode = 1;
  },
);
