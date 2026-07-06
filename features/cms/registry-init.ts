import { registerBlock } from './block-renderer';
import { HeroBlock, MarkdownBlock, DividerBlock } from './blocks/standard-blocks';

// Call this once at the app root or inside layout to initialize the registry
export function initializeCmsRegistry() {
  registerBlock('hero', HeroBlock);
  registerBlock('markdown', MarkdownBlock);
  registerBlock('divider', DividerBlock);
  // Future blocks: registerBlock('timeline', TimelineBlock); etc.
}
