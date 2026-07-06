import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BlockRenderer } from '@/features/cms/block-renderer';
import { CmsBlock } from '@/features/cms/types';
import { notFound } from 'next/navigation';

export default async function DynamicHomePage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  // Fetch the 'home' page
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'home')
    .eq('is_published', true)
    .single();

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Welcome to Portfolio OS</h1>
        <p className="text-muted-foreground mt-2">Please create and publish a 'home' page in the CMS to view content.</p>
      </div>
    );
  }

  // Fetch top-level blocks for this page
  const { data: blocks } = await supabase
    .from('blocks')
    .select('*')
    .eq('page_id', page.id)
    .is('parent_id', null)
    .order('sort_order', { ascending: true });

  const rootBlocks = (blocks as CmsBlock[]) || [];

  return (
    <main className="min-h-screen w-full flex flex-col">
      {rootBlocks.length > 0 ? (
        rootBlocks.map(block => (
          <BlockRenderer key={block.id} block={block} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 text-center px-4">
          <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center mb-4">
            <span className="text-muted-foreground text-2xl">+</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">This page is empty</h2>
          <p className="text-muted-foreground max-w-md">
            The "home" page exists in the database, but no content blocks have been added yet. 
            Head over to the Admin Panel to build this page using the Block CMS.
          </p>
        </div>
      )}
    </main>
  );
}
