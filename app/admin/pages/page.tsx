'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { CmsPage } from '@/features/cms/types';
import { Plus, Edit, Eye, EyeOff, Layout } from 'lucide-react';
import Link from 'next/link';

export default function PagesAdmin() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function fetchPages() {
      const { data } = await supabase.from('pages').select('*').order('created_at', { ascending: false });
      if (data) setPages(data);
    }
    fetchPages();
  }, []);

  return (
    <AdminShell title="Page CMS" description="Manage dynamic pages and configure their content blocks.">
      <div className="flex justify-end mb-6">
        <Button className="gap-2"><Plus className="w-4 h-4"/> Create Page</Button>
      </div>

      <div className="grid gap-4">
        {pages.map(page => (
          <Card key={page.id} className="flex flex-row items-center justify-between p-6">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {page.title} 
                {!page.is_published && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Draft</span>}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">/{page.slug}</p>
            </div>
            
            <div className="flex gap-2">
               <Link href={`/admin/pages/${page.id}`}>
                 <Button variant="outline" size="sm" className="gap-2">
                   <Layout className="w-4 h-4" /> Builder
                 </Button>
               </Link>
               <Button variant="ghost" size="icon">
                 <Edit className="w-4 h-4 text-muted-foreground" />
               </Button>
            </div>
          </Card>
        ))}
        {pages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            No pages found. Create your first page.
          </div>
        )}
      </div>
    </AdminShell>
  );
}
