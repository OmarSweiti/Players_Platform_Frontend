// Breaks features-meet-through-their-index: reaches past alpha's index.
import { alphaValue as fromInternals } from '../alpha/internal';
// Allowed: alpha through its index.
import { alphaValue } from '../alpha';

export const betaValue = [fromInternals, alphaValue];
