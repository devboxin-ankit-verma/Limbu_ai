/**
 * Checkmark feature list for pricing cards.
 */

import { CheckIcon } from './icons';

interface Props {
  features: string[];
}

export function FeatureList({ features }: Props) {
  return (
    <ul className="m-feature-list">
      {features.map((feature) => (
        <li key={feature}>
          <CheckIcon />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}
