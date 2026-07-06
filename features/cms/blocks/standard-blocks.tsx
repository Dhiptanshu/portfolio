import React from 'react';
import { CmsBlock } from '../types';

export function HeroBlock({ block }: { block: CmsBlock }) {
  const { title, subtitle, ctaText, ctaLink } = block.content;

  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">{title}</h1>
      {subtitle && <p className="text-xl text-muted-foreground max-w-2xl mb-8">{subtitle}</p>}
      {ctaText && (
        <a href={ctaLink || '#'} className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:scale-105 transition-transform">
          {ctaText}
        </a>
      )}
    </section>
  );
}

export function MarkdownBlock({ block }: { block: CmsBlock }) {
  const { markdown } = block.content;
  
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-3xl mx-auto px-4">
      {/* In a real implementation, you'd parse this with react-markdown */}
      <div dangerouslySetInnerHTML={{ __html: markdown || 'Empty markdown block.' }} />
    </div>
  );
}

export function DividerBlock({ block }: { block: CmsBlock }) {
  return <hr className="my-8 border-border max-w-5xl mx-auto w-full" />;
}
