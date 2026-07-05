export function normalizeTypography(s: string): string {
  if (!s) return '';
  return s
    // Smart double quotes -> "
    .replace(/[\u201c\u201d]/g, '"')
    // Smart single quotes / apostrophes -> '
    .replace(/[\u2018\u2019]/g, "'")
    // en dash -> --
    .replace(/\u2013/g, '--')
    // em dash -> ---
    .replace(/\u2014/g, '---')
    // bullets / middots -> -
    .replace(/[\u2022\u00b7]/g, '-')
    // ellipsis -> ...
    .replace(/\u2026/g, '...')
    // exotic spaces -> standard space
    .replace(/[\u00a0\u2000-\u200a\u202f\u205f\u3000]/g, ' ')
    // strip zero-width chars
    .replace(/[\u200b\u200c\u200d\ufeff]/g, '')
    // strip other control characters except tab (\t), newline (\n), carriage return (\r)
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
}

export function toLatin1Safe(s: string): string {
  const normalized = normalizeTypography(s);
  // Drop characters above U+00FF (charCode > 255)
  return normalized
    .split('')
    .filter(char => char.charCodeAt(0) <= 255)
    .join('');
}
