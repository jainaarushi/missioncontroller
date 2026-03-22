// Ghibli-style avatar prompts — one per agent category
// Used with GPT-image-1 to transform user's face into themed Ghibli characters

export const AVATAR_CATEGORIES = [
  "product",
  "research",
  "sales",
  "marketing",
  "operations",
  "lifestyle",
  "creative",
] as const;

export type AvatarCategoryId = (typeof AVATAR_CATEGORIES)[number];

const GHIBLI_PREAMBLE = `Studio Ghibli anime style. Soft watercolor palette, warm lighting, hand-painted feel. Upper body portrait, facing slightly left. Gender-neutral character (use they/them). NO text, NO watermarks, NO logos. Clean background wash. Expressive eyes, gentle smile.`;

interface CategoryPrompt {
  id: AvatarCategoryId;
  label: string;
  prompt: string;
}

export const AVATAR_PROMPTS: CategoryPrompt[] = [
  {
    id: "product",
    label: "Product & Engineering",
    prompt: `${GHIBLI_PREAMBLE} Transform this person into a Ghibli-style engineer/builder character. They wear rolled-up sleeves and have a pencil tucked behind their ear. They hold a glowing blueprint that radiates soft light. Background: warm indigo watercolor wash. Props: tiny floating gears and circuit patterns around them.`,
  },
  {
    id: "research",
    label: "Research & Intelligence",
    prompt: `${GHIBLI_PREAMBLE} Transform this person into a Ghibli-style scholar/researcher character. They wear round glasses and a cozy cardigan. They hold an open book that emits a soft magical glow with floating data particles. Background: sky blue watercolor wash. Props: constellation-like connection lines float around them.`,
  },
  {
    id: "sales",
    label: "Sales & Revenue",
    prompt: `${GHIBLI_PREAMBLE} Transform this person into a Ghibli-style dealmaker character. They wear a sharp modern blazer with confidence. Behind them, a gentle upward growth chart glows in emerald light. Background: emerald green watercolor wash. Props: small golden coins float whimsically around them.`,
  },
  {
    id: "marketing",
    label: "Marketing & Content",
    prompt: `${GHIBLI_PREAMBLE} Transform this person into a Ghibli-style storyteller/creator character. They wear a stylish turtleneck. They hold a megaphone that emits sparkles and colorful light particles. Background: warm coral watercolor wash. Props: floating speech bubbles and tiny stars surround them.`,
  },
  {
    id: "operations",
    label: "Operations & Productivity",
    prompt: `${GHIBLI_PREAMBLE} Transform this person into a Ghibli-style conductor/organizer character. They wear a neat vest over a crisp shirt. They hold a clipboard with glowing checkmarks. Floating gears and clock parts orbit gently around them. Background: warm amber watercolor wash.`,
  },
  {
    id: "lifestyle",
    label: "Health & Lifestyle",
    prompt: `${GHIBLI_PREAMBLE} Transform this person into a Ghibli-style life guide character. They wear a flowing, natural outfit with soft earth tones. A gentle glowing heart floats near their chest. Leaves and flower petals drift around them. Background: soft pink watercolor wash.`,
  },
  {
    id: "creative",
    label: "Creative & Fun",
    prompt: `${GHIBLI_PREAMBLE} Transform this person into a Ghibli-style artist character. They wear a paint-splattered apron over casual clothes. They hold a magical paintbrush that trails sparkles and color droplets. Background: lavender watercolor wash. Props: floating paint splatters and tiny stars.`,
  },
];

export function getAvatarPrompt(categoryId: AvatarCategoryId): string {
  return AVATAR_PROMPTS.find((p) => p.id === categoryId)?.prompt || AVATAR_PROMPTS[6].prompt;
}
