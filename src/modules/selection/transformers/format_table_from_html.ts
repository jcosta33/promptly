import { format_code_block } from "./format_code_block";

// Helper to format tables from HTML structure
export function format_table_from_html(html: string): string {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Handle selections that might only be part of a table (e.g., just some cells)
  // Find the closest table element if the selection isn't the table itself.
  let tableElement = tempDiv.querySelector("table");
  if (!tableElement && tempDiv.firstElementChild) {
    tableElement = tempDiv.firstElementChild.closest("table");
  }

  // If no table context found, fallback to code block
  if (!tableElement) return format_code_block(html);

  let markdownTable = "";
  const headers: string[] = [];
  const rows: string[][] = [];
  let headerProcessed = false;

  // Process header rows (thead or first tr with th)
  const headerRows = tableElement.querySelectorAll("thead tr, tr:has(th)");
  headerRows.forEach((tr, rowIndex) => {
    // Only process the first header row found
    if (headerProcessed) return;
    tr.querySelectorAll("th").forEach((th) => {
      headers.push(th.textContent?.trim() || "");
    });
    if (headers.length > 0) {
      headerProcessed = true; // Mark header as processed
    }
  });

  // Create markdown header separator if headers were found
  if (headers.length > 0) {
    markdownTable += `| ${headers.join(" | ")} |\n`;
    markdownTable += `| ${headers
      .map(() => {
        return "---";
      })
      .join(" | ")} |\n`;
  }

  // Process body rows (tbody or tr without th)
  tableElement.querySelectorAll("tbody tr, tr:not(:has(th))").forEach((tr) => {
    const rowData: string[] = [];
    tr.querySelectorAll("td").forEach((td) => {
      // Basic handling of cell content - could be enhanced for complex content
      rowData.push(td.textContent?.trim().replace(/\n/g, " ") || ""); // Replace newlines in cells
    });
    // Ensure row matches header count if possible, pad otherwise
    if (rowData.length > 0) {
      while (headers.length > 0 && rowData.length < headers.length) {
        rowData.push("");
      }
      rows.push(rowData.slice(0, headers.length || undefined)); // Trim to header length if headers exist
    }
  });

  // Add data rows to markdown table
  rows.forEach((row) => {
    markdownTable += `| ${row.join(" | ")} |\n`;
  });

  // If no rows were processed but we had a table tag, return structure
  if (!markdownTable.trim()) {
    return `<table>\n${html}\n</table>`; // Indicate table structure
  }

  return markdownTable.trim();
}
