#!/usr/bin/env node
// Screenshots for validation evidence (the umbrella's
// docs/implementation/02-development-workflow.md, "Validate"): each named
// page as a person sees it, in a real browser, through the local HTTPS proxy.
//
//   node scripts/capture-evidence.mjs --out <dir> [--viewport desktop|mobile] <name>=<url>…
//   npm run evidence -- --out /tmp/pr-51 en-players=https://sadara.localhost/en/players ar-players=https://sadara.localhost/ar/players
//
// A name is [a-z0-9-]+ and becomes <dir>/<name>.png (<name>-mobile.png on the
// mobile viewport); the whole page is captured once it has loaded and its
// fonts are ready. The local proxy's certificate comes from the stack's own
// authority, so it is accepted for *.localhost only; any other host must
// present a certificate the browser trusts.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  mobile: {
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  },
};
const NAME = /^[a-z0-9][a-z0-9-]*$/;

function parse(argv) {
  const pages = [];
  let out;
  let viewport = 'desktop';
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out') out = argv[(i += 1)];
    else if (argv[i] === '--viewport') viewport = argv[(i += 1)];
    else {
      const at = argv[i].indexOf('=');
      const name = argv[i].slice(0, at);
      if (at < 1 || !NAME.test(name)) {
        throw new Error(
          `"${argv[i]}" is not <name>=<url> with a [a-z0-9-] name`,
        );
      }
      pages.push({ name, url: new URL(argv[i].slice(at + 1)) });
    }
  }
  if (!out) throw new Error('--out <dir> names where the screenshots go');
  if (!(viewport in VIEWPORTS))
    throw new Error('--viewport is desktop or mobile');
  if (pages.length === 0) throw new Error('name at least one <name>=<url>');
  return { out, viewport, pages };
}

const isLocal = (url) =>
  url.hostname === 'localhost' || url.hostname.endsWith('.localhost');

async function main(argv) {
  const { out, viewport, pages } = parse(argv);
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const { name, url } of pages) {
      const locale = /^\/ar(\/|$)/.test(url.pathname) ? 'ar' : 'en';
      const context = await browser.newContext({
        ...VIEWPORTS[viewport],
        locale,
        ignoreHTTPSErrors: isLocal(url),
      });
      const page = await context.newPage();
      const response = await page.goto(url.href, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const file = join(
        out,
        `${name}${viewport === 'mobile' ? '-mobile' : ''}.png`,
      );
      await page.screenshot({ path: file, fullPage: true });
      console.log(
        `evidence: ${file} — ${response?.status() ?? 'no response'} ${url.href}`,
      );
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

main(process.argv.slice(2)).catch((error) => {
  console.error(`evidence: ${error.message}`);
  process.exitCode = 1;
});
