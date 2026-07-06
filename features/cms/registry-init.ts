import { registerBlock } from './block-renderer';
import { HeroBlock, MarkdownBlock, DividerBlock } from './blocks/standard-blocks';
import { SectionFeedBlock } from './blocks/section-feed-block';

// Call this once at the app root or inside layout to initialize the registry
export function initializeCmsRegistry() {
  registerBlock('hero', HeroBlock);
  registerBlock('markdown', MarkdownBlock);
  registerBlock('divider', DividerBlock);
  registerBlock('section-feed', SectionFeedBlock as any);
}
