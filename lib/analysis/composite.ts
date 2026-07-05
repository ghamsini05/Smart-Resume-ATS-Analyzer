import { Verdict } from '../../types/analysis';

export function calculateCompositeAndVerdict(matchScore: number, projAvg: number, formatScore: number) {
  const composite = Math.round(matchScore * 0.45 + projAvg * 0.35 + formatScore * 0.20);
  
  let verdict: Verdict = 'needs-work';
  if (composite >= 80) {
    verdict = 'ready';
  } else if (composite >= 60) {
    verdict = 'almost';
  }

  return {
    composite,
    verdict
  };
}
