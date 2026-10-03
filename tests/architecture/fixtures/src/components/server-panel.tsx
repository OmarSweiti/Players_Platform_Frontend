// Allowed: a server component reads through src/server.
import { readOnServer } from '../server/api';

export function ServerPanel() {
  return <p>{readOnServer()}</p>;
}
