/**
 * Check if text looks like poetry
 */
export function looks_like_poetry(text: string): boolean {
  // Clean the text and get lines
  const lines = text
    .split("\n")
    .map((line) => {
      return line.trim();
    })
    .filter(Boolean);
  if (lines.length < 2) return false;

  // Calculate average line length
  const avgLineLength =
    lines.reduce((sum, line) => {
      return sum + line.length;
    }, 0) / lines.length;

  // Poetry characteristics:
  // 1. Consistent rhythm or line length
  // 2. Short lines compared to prose (typically < 60 chars)
  // 3. Many lines end without punctuation
  // 4. Often has stanza breaks

  // Check for lines ending without punctuation
  const unpunctuatedLineEnds = lines.filter((line) => {
    return !/[.!?,:;]$/.test(line);
  }).length;
  const unpunctuatedRatio = unpunctuatedLineEnds / lines.length;

  // Check if lines are short (poetry typical)
  const shortLines = lines.filter((line) => {
    return line.length < 60;
  }).length;
  const shortLineRatio = shortLines / lines.length;

  // Check for consistent line length (variation less than 40%)
  const lineVariation = lines.map((line) => {
    return Math.abs(line.length - avgLineLength) / avgLineLength;
  });
  const consistentLength =
    lineVariation.filter((v) => {
      return v < 0.4;
    }).length /
      lines.length >
    0.6;

  // Combine factors to determine if it's poetry
  // Require short lines and either unpunctuated ends or consistent length
  return (
    avgLineLength < 50 &&
    shortLineRatio > 0.7 &&
    (unpunctuatedRatio > 0.4 || consistentLength)
  );
}
