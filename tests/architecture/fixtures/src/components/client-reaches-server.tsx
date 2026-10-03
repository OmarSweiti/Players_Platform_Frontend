'use client';
// Breaks the browser boundary: a client component imports src/server.
import { readOnServer } from '../server/api';

export function ClientReachesServer() {
  return <p>{readOnServer()}</p>;
}
