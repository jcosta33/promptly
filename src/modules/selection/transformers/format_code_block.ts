// Helper function to format code blocks consistently
export function format_code_block(
  content: string,
  language: string = ""
): string {
  return "```" + language + "\n" + content.trim() + "\n```";
}
