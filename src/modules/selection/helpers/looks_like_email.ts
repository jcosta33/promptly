/**
 * Check if text looks like an email address
 */
export function looks_like_email(text: string): boolean {
  // Basic email pattern (allows for + sign in local part)
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(text.trim());
}
