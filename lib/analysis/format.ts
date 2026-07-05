export function analyzeFormat(resume: string) {
  const hasContact = /@/.test(resume) && /\d{3}/.test(resume);
  const hasSections = /education/i.test(resume) && /(skills|experience|projects)/i.test(resume);

  const formatScore = (hasContact ? 50 : 20) + (hasSections ? 50 : 20);

  return {
    hasContact,
    hasSections,
    formatScore
  };
}
