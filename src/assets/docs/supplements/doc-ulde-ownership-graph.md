# 1. field‑centric ownership graph

```mermaid
graph TD
  %% Core content pipeline
  MarkdownParser["Markdown Parser"] -->|Writes| Content["content"]
  KaTeXPlugin["KaTeX Plugin"] -->|Writes| Content
  LinksPlugin["Links Plugin"] -->|Writes| Content
  ContainersPlugin["Containers Plugin"] -->|Writes| Content

  %% Structural data
  TOCPlugin["TOC Plugin"] -->|Writes| Toc["toc[]"]
  AnchorsPlugin["Anchors Plugin"] -->|Reads| Toc
  DebugOverlayPlugin["Debug Overlay Plugin"] -->|Reads| Toc

  %% Links metadata
  LinksPlugin -->|Writes| Links["links[]"]
  DebugOverlayPlugin -->|Reads| Links

  %% Renderer and highlight
  SyntaxHighlightPlugin["Syntax Highlight Plugin"] -->|Writes| Codeblocks["codeblocks[]"]
  SyntaxHighlightPlugin -->|Writes| HighlightRequests["highlightRequests[]"]
  HighlightRenderer["Highlight Renderer"] -->|Reads| HighlightRequests
  HighlightRenderer -->|Writes| Html["html / finalHtml"]

  %% Navigation
  ScrollSpyPlugin["ScrollSpy Plugin"] -->|Reads| Anchors["anchors[]"]

  %% DevTools and system
  TimelinePlugin["Timeline Plugin"] -->|Writes| Timeline["timeline"]
  ProfilerPlugin["Profiler Plugin"] -->|Reads| Timeline
  DebugOverlayPlugin -->|Reads| Timeline
  Orchestrator["Orchestrator"] -->|Writes| Timings["timings"]
  DebugOverlayPlugin -->|Reads| Timings
  ProfilerPlugin -->|Reads| Timings

```
