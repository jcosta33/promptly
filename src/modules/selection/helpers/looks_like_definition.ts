/**
 * Check if text looks like a definition
 */
export function looks_like_definition(text: string): boolean {
  // Definition patterns
  const definitionPatterns = [
    // Term: definition format
    /^[A-Za-z\s-]+:\s*\w/,
    // Dictionary-style format
    /^[A-Za-z\s-]+\s+\((?:noun|verb|adj|adv|n\.|v\.|adj\.|adv\.)\)\s+\w/i,
  ];

  return definitionPatterns.some((pattern) => {
    return pattern.test(text);
  });
}
