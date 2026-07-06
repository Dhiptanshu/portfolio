import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PageBuilder } from '@/features/cms/builder/page-builder';
import { AdminShell } from '@/components/admin-shell';
import { notFound } from 'next/navigation';
import { CmsBlock } from '@/features/cms/types';
import { revalidatePath } from 'next/cache';

export default async function PageBuilderAdminPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createSupabaseServerClient();
  
  if (!supabase) return notFound();

  const { data: page } = await supabase.from('pages').select('*').eq('id', params.id).single();
  
  if (!page) return notFound();

  const { data: blocks } = await supabase
    .from('blocks')
    .select('*')
    .eq('page_id', page.id)
    .order('sort_order', { ascending: true });

  async function handleSaveBlocks(newBlocks: CmsBlock[]) {
    'use server';
    const supabaseServer = await createSupabaseServerClient();
    
    // Update sort orders and visibility in DB
    for (const block of newBlocks) {
      await supabaseServer!.from('blocks').update({
        sort_order: block.sort_order,
        is_visible: block.is_visible
      }).eq('id', block.id);
    }
    
    revalidatePath(`/${page.slug}`);
    revalidatePath('/admin/pages');
  }

  return (
    <AdminShell title={`Builder: ${page.title}`} description={`Manage the layout for /${page.slug}`}>
      <PageBuilder initialBlocks={blocks || []} onSave={handleSaveBlocks} />
    </AdminShell>
  );
}
