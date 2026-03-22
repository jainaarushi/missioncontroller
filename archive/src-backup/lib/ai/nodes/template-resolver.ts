// Resolves {{placeholder}} in AI prompt templates using NodeContext outputs

import type { NodeContext } from "./types";

/**
 * Replace {{key}} placeholders with values from context.outputs.
 * Special keys: {{input}} = ctx.latestText, {{today}} = ctx.today, {{title}} = ctx.taskTitle
 */
export function resolveTemplate(template: string, ctx: NodeContext): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (key === "input") return String(ctx.outputs["input"] || ctx.taskDescription || ctx.taskTitle);
    if (key === "today") return ctx.today;
    if (key === "title") return ctx.taskTitle;
    if (key === "description") return ctx.taskDescription || "";

    const val = ctx.outputs[key];
    if (val === undefined || val === null) return "";
    if (typeof val === "string") return val;
    return JSON.stringify(val, null, 2);
  });
}
