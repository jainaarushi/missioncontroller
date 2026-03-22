import { z } from "zod";

export interface ParsedFileData {
  rows: Record<string, unknown>[];
  columns: string[];
}

const dataQueryParams = z.object({
  sql: z
    .string()
    .describe(
      "SQL query to execute. Use 'uploaded_data' as the table name. Supports SELECT, GROUP BY, ORDER BY, WHERE, aggregate functions (COUNT, SUM, AVG, MIN, MAX), LIMIT."
    ),
});

export function createDataQueryTool(data: ParsedFileData) {
  return {
    description: `Run SQL queries on the uploaded data. The table is called 'uploaded_data'. Available columns: ${data.columns.join(", ")}. Total rows: ${data.rows.length}.`,
    parameters: dataQueryParams,
    execute: async ({ sql }: z.infer<typeof dataQueryParams>) => {
      try {
        const alasql = (await import("alasql")).default;

        alasql("DROP TABLE IF EXISTS uploaded_data");
        alasql("CREATE TABLE uploaded_data");
        alasql.tables.uploaded_data.data = [...data.rows];

        const result = alasql(sql);

        if (Array.isArray(result)) {
          return {
            success: true,
            rows: result.slice(0, 100),
            rowCount: result.length,
            truncated: result.length > 100,
          };
        }

        return { success: true, result, rowCount: 1 };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Query failed",
          hint: "Check column names and SQL syntax. Available columns: " + data.columns.join(", "),
        };
      }
    },
  };
}

// Parse CSV/tabular data from the task description
export function parseFileDataFromDescription(description: string): ParsedFileData | null {
  const attachedMatch = description.match(/\[Attached: .+?\]\n([\s\S]+)/);
  if (!attachedMatch) return null;

  const content = attachedMatch[1].trim();
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return null;

  const firstLine = lines[0];
  let delimiter = ",";
  if (firstLine.includes("\t") && !firstLine.includes(",")) delimiter = "\t";
  else if (firstLine.includes("|") && !firstLine.includes(",")) delimiter = "|";

  const columns = firstLine.split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ""));

  const rows: Record<string, unknown>[] = [];
  for (let i = 1; i < lines.length && i <= 10000; i++) {
    const values = lines[i].split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ""));
    const row: Record<string, unknown> = {};
    for (let j = 0; j < columns.length; j++) {
      const val = values[j] || "";
      const num = Number(val);
      row[columns[j]] = val === "" ? null : isNaN(num) ? val : num;
    }
    rows.push(row);
  }

  if (rows.length === 0) return null;
  return { rows, columns };
}
