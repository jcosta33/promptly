// Helper function to extract text content from HTML, preserving structure minimally
export function extract_text_from_html(html: string): string {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  // Basic text extraction - could be improved to handle code indentation better
  return tempDiv.textContent || "";
}
