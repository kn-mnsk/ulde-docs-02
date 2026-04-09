import { UldePlugin } from '../../registry/plugin-registry';

export const HeadingAnchorsPlugin: UldePlugin = {
  name: 'heading-anchors',
  phase: 'post-content',
  run(ctx: any) {
    ctx.html = ctx.html.replace(/<h([1-6])>(.*?)<\/h\1>/g, (m: any, level: any, text: any) => {
      const id = String(text)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      return `<h${level} id="${id}">${text}</h${level}>`;
    });
  }
};
