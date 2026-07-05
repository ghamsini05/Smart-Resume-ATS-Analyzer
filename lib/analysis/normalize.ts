export function normalizeText(s: string): string {
  if (!s) return '';
  // Convert CRLF/CR to \n
  const withNewlines = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Trim trailing spaces on each line
  const linesTrimmed = withNewlines.split('\n').map(line => line.trimEnd()).join('\n');
  // Collapse 3+ blank lines (which is 4+ consecutive \n characters) to 2 blank lines (3 consecutive \n characters)
  const collapsed = linesTrimmed.replace(/\n{4,}/g, '\n\n\n');
  // Trim the whole string
  return collapsed.trim();
}
