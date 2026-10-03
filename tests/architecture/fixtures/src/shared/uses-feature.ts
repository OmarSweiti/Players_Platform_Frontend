// Breaks shared-imports-no-feature: shared code depends on a feature.
import { alphaValue } from '../features/alpha';

export const sharedValue = alphaValue;
