// Allowed by itself: a helper that happens to use a server-only module.
import { secret } from './secrets';

export const helper = () => secret();
