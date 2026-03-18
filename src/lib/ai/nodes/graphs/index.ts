// Central registry of all 80 template pipeline graphs

import type { PipelineGraph } from "../types";
import { CAREER_GRAPHS } from "./career";
import { MONEY_GRAPHS } from "./money";
import { LEGAL_GRAPHS } from "./legal";
import { HOUSING_GRAPHS } from "./housing";
import { HEALTH_GRAPHS } from "./health";
import { EDUCATION_GRAPHS } from "./education";
import { SHOPPING_GRAPHS } from "./shopping";
import { FREELANCE_GRAPHS } from "./freelance";
import { PARENTING_GRAPHS } from "./parenting";
import { TRAVEL_GRAPHS } from "./travel";
import { GROWTH_GRAPHS } from "./growth";

export const NODE_GRAPHS: Record<string, PipelineGraph> = {
  ...CAREER_GRAPHS,
  ...MONEY_GRAPHS,
  ...LEGAL_GRAPHS,
  ...HOUSING_GRAPHS,
  ...HEALTH_GRAPHS,
  ...EDUCATION_GRAPHS,
  ...SHOPPING_GRAPHS,
  ...FREELANCE_GRAPHS,
  ...PARENTING_GRAPHS,
  ...TRAVEL_GRAPHS,
  ...GROWTH_GRAPHS,
};

/**
 * Get the node graph for an agent slug.
 * Returns null if no graph is defined (falls back to legacy pipeline).
 */
export function getNodeGraph(slug: string): PipelineGraph | null {
  return NODE_GRAPHS[slug] || null;
}
