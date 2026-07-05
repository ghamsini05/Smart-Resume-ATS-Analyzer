export function getPrediction(composite: number, missingCount: number) {
  const outcome: 'yes' | 'borderline' | 'no' =
    composite >= 80 ? 'yes' : composite >= 60 ? 'borderline' : 'no';

  let reason = '';
  if (outcome === 'yes') {
    reason = 'Your resume shows strong keyword alignment and excellent project formatting.';
  } else {
    reason = `Your resume is missing ${missingCount} required keyword(s) from the job description.`;
  }

  return {
    outcome,
    reason
  };
}
