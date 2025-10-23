import satori from "satori"
import { initWasm, Resvg } from "@resvg/resvg-wasm"
import type { Template } from "@meme-alchemist/shared/types"

let wasmInitialized = false
let fontCache: ArrayBuffer | null = null

export class SatoriRenderer {
  async initialize() {
    // Initialize Resvg WASM once
    if (!wasmInitialized) {
      await initWasm(fetch("https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm"))
      wasmInitialized = true
      console.log("[Satori] Resvg WASM initialized")
    }

    if (!fontCache) {
      try {
        const response = await fetch(
          "https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/SubsetOTF/SC/NotoSansS-Regular.otf"
        )
        fontCache = await response.arrayBuffer()
        console.log("[Satori] Font loaded successfully")
      } catch (error) {
        console.warn("[Satori] Failed to load font, will use fallback:", error)
        // Continue without custom font - satori will use default
      }
    }
  }

  async renderToSVG(
    template: Template,
    payload: Record<string, string>
  ): Promise<string> {
    const jsx = this.buildJSX(template, payload)

    const fonts = fontCache
      ? [
          {
            name: "Noto Sans SC",
            data: fontCache,
            weight: 400 as const,
            style: "normal" as const,
          },
        ]
      : []

    return await satori(jsx, {
      width: template.canvas.w,
      height: template.canvas.h,
      fonts,
    })
  }

  async svgToPng(svg: string): Promise<Uint8Array> {
    if (!wasmInitialized) {
      throw new Error("Renderer not initialized. Call initialize() first.")
    }

    const resvg = new Resvg(svg, {
      background: "rgba(0, 0, 0, 0)",
    })
    const pngData = resvg.render()
    return pngData.asPng()
  }

  private buildJSX(
    template: Template,
    payload: Record<string, string>
  ): React.ReactElement {
    return {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: template.canvas.bg,
          position: "relative",
          fontFamily: fontCache ? "Noto Sans SC" : "sans-serif",
        },
        children: template.slots.map((slot, index) => {
          const fontSize = this.getFontSize(slot.style)
          const fontWeight = this.getFontWeight(slot.style)

          return {
            type: "div",
            key: index,
            props: {
              style: {
                position: "absolute",
                left: `${slot.x}px`,
                top: `${slot.y}px`,
                width: `${slot.w}px`,
                fontSize: `${fontSize}px`,
                fontWeight,
                color: "#fff",
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              },
              children: payload[slot.name] || "",
            },
          }
        }),
      },
    } as React.ReactElement
  }

  private getFontSize(style: string): number {
    switch (style) {
      case "heading":
      case "title":
        return 48
      case "body":
        return 24
      case "note":
      case "examples":
        return 18
      default:
        return 24
    }
  }

  private getFontWeight(style: string): number {
    switch (style) {
      case "heading":
      case "title":
        return 700
      default:
        return 400
    }
  }
}
