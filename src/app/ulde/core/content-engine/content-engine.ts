// src/app/ulde/core/content-engine/content-engine.ts

import {
  UldePluginRegistry,
  UldeDocNode,
  UldeContentResult,
  UldeContentSource,
} from '../runtime/ulde.types';

import { findDocPathById, findDocMetaById } from '../../utils/docs/docs-lookup';

/**
 * ContentEngine is a thin orchestrator over the ULDE plugin registry.
 * It knows how to:
 *  - turn a content source into a UldeDocNode
 *  - run the metadata + content pipelines
 */
export class ContentEngine {
  constructor(private readonly registry: UldePluginRegistry) { }


  /**
   * Load a markdow file
   */
  async loadDocById(docId: string): Promise<{ text: string, path: string }> {
    const filePath = findDocPathById(docId);

    if (!filePath) {
      throw new Error(`Doc not found for id: ${docId}`);
    }

    const res = await fetch(filePath);
    if (!res.ok) {
      throw new Error(`Failed to load: ${filePath}`);
    }
    // let text!: string;
    // res.text().then(v => text = v)
    const text = await res.text();

    return { text: text, path: filePath };
  }

  async loadDocMetaById(docId: string): Promise<UldeContentSource> {
    const meta = findDocMetaById(docId);

    if (!meta) {
      throw new Error(`Doc not found for id: ${docId}`);
    }

    const res = await fetch(meta.path);
    if (!res.ok) {
      throw new Error(`Failed to load: ${meta.path}`);
    }
    // let text!: string;
    // res.text().then(v => text = v)
    const text = await res.text();
    const source: UldeContentSource = {
      id: docId,
      path: meta.path,
      title: meta.title,
      format: 'markdown',
      rawContent: text
    };

    return source;
  }


  /**
   * Convert a generic content source into a UldeDocNode.
   */
  createDocNode(source: UldeContentSource): UldeDocNode {
    return {
      id: source.id,
      path: source.path,
      title: source.title,
      rawContent: source.rawContent,
      format: source.format,
      metadata: { ...(source.metadata ?? {}) },
    };
  }

  /**
   * Run both metadata and content pipelines for a given doc node.
   */
  async renderDoc(doc: UldeDocNode): Promise<UldeContentResult> {
    const pipeline = this.registry.buildPipeline();

    // First, let metadata transformers enrich/override metadata
    const enrichedMetadata = await pipeline.runMetadata(doc);

    // Then run the content pipeline with the enriched metadata
    const result = await pipeline.runContent({
      ...doc,
      metadata: enrichedMetadata,
    });

    return {
      ...result,
      metadata: enrichedMetadata,
    };
  }

  /**
   * Convenience: render directly from a content source.
   */
  async renderFromSource(source: UldeContentSource): Promise<UldeContentResult> {
    const doc = this.createDocNode(source);
    return this.renderDoc(doc);
  }
}
