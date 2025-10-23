import type { Template } from "@meme-alchemist/shared/types"

export const TEMPLATES: Record<string, Template> = {
  "two-panel-v1": {
    id: "two-panel-v1",
    name: "Two Panel",
    type: "meme_image",
    canvas: { w: 1080, h: 1350, bg: "#0f0f0f" },
    slots: [
      {
        name: "title",
        kind: "text",
        x: 60,
        y: 80,
        w: 960,
        style: "heading",
      },
      {
        name: "left",
        kind: "text",
        x: 80,
        y: 300,
        w: 420,
        style: "body",
      },
      {
        name: "right",
        kind: "text",
        x: 580,
        y: 300,
        w: 420,
        style: "body",
      },
      {
        name: "footer",
        kind: "text",
        x: 60,
        y: 1250,
        w: 960,
        style: "note",
      },
    ],
    ratios: ["1:1", "4:5", "9:16"],
  },

  "glossary-v1": {
    id: "glossary-v1",
    name: "Glossary",
    type: "meme_image",
    canvas: {
      w: 1080,
      h: 1080,
      bg: "#667eea",
    },
    slots: [
      {
        name: "term",
        kind: "text",
        x: 80,
        y: 100,
        w: 920,
        style: "title",
      },
      {
        name: "definition",
        kind: "text",
        x: 80,
        y: 400,
        w: 920,
        style: "body",
      },
      {
        name: "examples",
        kind: "text",
        x: 80,
        y: 700,
        w: 920,
        style: "examples",
      },
    ],
    ratios: ["1:1"],
  },
}

export function getTemplate(id: string): Template | null {
  return TEMPLATES[id] || null
}
