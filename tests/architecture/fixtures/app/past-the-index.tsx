// Breaks the-app-uses-features-through-their-index: a route reaches past an index.
import { alphaValue } from '../src/features/alpha/internal';

export default function Page() {
  return <p>{alphaValue}</p>;
}
