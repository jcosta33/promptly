/**
 * Check if text looks like social media content
 */
export function looks_like_social_media(text: string): boolean {
  // Social media patterns
  const socialMediaPatterns = [
    // @mentions
    /@[a-zA-Z0-9_]{1,15}\b/,
    // Hashtags
    /#[a-zA-Z0-9_]+\b/,
    // Common social media terms
    /\b(?:RT|retweet|like|share|follow|comment)\b/i,
    // URLs shortened with common services
    /\b(?:bit\.ly|t\.co|goo\.gl|tinyurl\.com)\/\w+\b/i,
  ];

  return socialMediaPatterns.some((pattern) => {
    return pattern.test(text);
  });
}
