import React from 'react';
import { FadeIn, SlideUp } from '@/features/motion';
import { CmsBlock } from './types';

interface BlockRendererProps {
  block: CmsBlock;
}

// Extensible registry to map type strings to React components
export const BlockRegistry: Record<string, React.FC<{ block: CmsBlock }>> = {};

export function registerBlock(type: string, component: React.FC<{ block: CmsBlock }>) {
  BlockRegistry[type] = component;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  if (!block.is_visible) return null;

  const Component = BlockRegistry[block.type];
  
  if (!Component) {
    return (
      <div className="p-4 border border-destructive text-destructive text-sm bg-destructive/10 rounded-md">
        Unknown block type: {block.type}
      </div>
    );
  }

  const { animation = 'none', delay = 0, paddingTop = 'py-0', paddingBottom = 'py-0' } = block.settings || {};

  const content = (
    <div className={`${paddingTop} ${paddingBottom}`}>
      <Component block={block} />
      {/* Recursively render nested blocks if they exist */}
      {block.children && block.children.length > 0 && (
        <div className="nested-blocks pl-4 border-l mt-4">
           {block.children.sort((a, b) => a.sort_order - b.sort_order).map(child => (
             <BlockRenderer key={child.id} block={child} />
           ))}
        </div>
      )}
    </div>
  );

  if (animation === 'fade') {
    return <FadeIn delay={delay}>{content}</FadeIn>;
  }
  
  if (animation === 'slide') {
    return <SlideUp delay={delay}>{content}</SlideUp>;
  }

  return content;
}
