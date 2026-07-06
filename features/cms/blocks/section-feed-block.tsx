import { CmsBlock } from '../types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCard, Stagger } from '@/features/motion';

export async function SectionFeedBlock({ block }: { block: CmsBlock }) {
  const sectionId = block.content.section_id;
  const layout = block.content.layout || 'grid'; // 'grid' or 'list'
  
  if (!sectionId) {
    return (
      <div className="p-4 border border-dashed text-muted-foreground text-center rounded-md">
        Section Feed: No section selected.
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .eq('section_id', sectionId)
    .eq('is_visible', true)
    .order('created_at', { ascending: false });

  if (!entries || entries.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No visible entries found for this section.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 tracking-tight capitalize">{block.content.title || 'Selected Works'}</h2>
      <Stagger className={layout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-6 max-w-3xl mx-auto"}>
        {entries.map((entry) => (
          <AnimatedCard key={entry.id} className="h-full">
            <Card className="h-full bg-card/50 backdrop-blur border-border/50 overflow-hidden flex flex-col">
              <CardHeader>
                <CardTitle>{entry.title}</CardTitle>
                {entry.short_description && <p className="text-sm text-muted-foreground mt-1">{entry.short_description}</p>}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {entry.tags.map((tag: string) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </Stagger>
    </div>
  );
}
