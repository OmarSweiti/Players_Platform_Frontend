'use client';
// Breaks the browser boundary: through a helper, a client component reaches a
// module that imports server-only.
import { helper } from '../lib/helper';

export function ClientReachesServerOnly() {
  return <p>{helper()}</p>;
}
