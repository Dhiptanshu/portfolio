import { google } from '@ai-sdk/google';
import { embedMany } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutes max duration for full index rebuild

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify admin status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // 2. Fetch all portfolio data
    const [
      { data: entries },
      { data: journeys },
      { data: skills },
      { data: achievements },
      { data: sections }
    ] = await Promise.all([
      supabase.from('entries').select('id, title, short_description, long_description, tags, section_id').eq('is_visible', true),
      supabase.from('journeys').select('id, title, subtitle, description, content_markdown, category, tech_stack').eq('is_visible', true),
      supabase.from('skills').select('id, name, description, xp').eq('is_visible', true),
      supabase.from('achievements').select('id, title, description, rarity, xp_reward').eq('is_visible', true),
      supabase.from('sections').select('id, title, slug').eq('is_visible', true),
    ]);

    // 3. Prepare documents for embedding
    const documents: { source_type: string, source_id: string, content: string, metadata: any }[] = [];

    // Process Entries (Projects, Hackathons, Internships, etc.)
    const sectionMap = new Map((sections || []).map(s => [s.id, s]));
    
    entries?.forEach(entry => {
      const section = sectionMap.get(entry.section_id);
      const content = `Title: ${entry.title}\nCategory: ${section?.title}\nSummary: ${entry.short_description}\nDetails: ${entry.long_description || ''}\nTags: ${(entry.tags || []).join(', ')}`;
      documents.push({
        source_type: 'entry',
        source_id: entry.id,
        content,
        metadata: { title: entry.title, url: `/${section?.slug}#${entry.id}` }
      });
    });

    // Process Journeys (Timeline)
    journeys?.forEach(journey => {
      const content = `Title: ${journey.title}\nSubtitle: ${journey.subtitle || ''}\nCategory: ${journey.category}\nDescription: ${journey.description}\nTech Stack: ${(journey.tech_stack || []).join(', ')}\nContent: ${journey.content_markdown || ''}`;
      documents.push({
        source_type: 'journey',
        source_id: journey.id,
        content,
        metadata: { title: journey.title, url: `/journey/${journey.id}` }
      });
    });

    // Process Skills
    skills?.forEach(skill => {
      const content = `Skill: ${skill.name}\nDescription: ${skill.description || ''}\nExperience XP: ${skill.xp}`;
      documents.push({
        source_type: 'skill',
        source_id: skill.id,
        content,
        metadata: { title: skill.name, url: `/skills` }
      });
    });

    // Process Achievements
    achievements?.forEach(achievement => {
      const content = `Achievement: ${achievement.title}\nRarity: ${achievement.rarity}\nDescription: ${achievement.description || ''}\nXP Reward: ${achievement.xp_reward}`;
      documents.push({
        source_type: 'achievement',
        source_id: achievement.id,
        content,
        metadata: { title: achievement.title, url: `/achievements` }
      });
    });

    if (documents.length === 0) {
      return NextResponse.json({ message: 'No documents found to index.' });
    }

    // 4. Generate Embeddings using Gemini
    const { embeddings } = await embedMany({
      model: google.textEmbeddingModel('text-embedding-004'),
      values: documents.map(d => d.content),
    });

    // 5. Delete old index and insert new one
    await supabase.from('portfolio_documents').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    const insertData = documents.map((doc, i) => ({
      ...doc,
      embedding: embeddings[i],
    }));

    // Insert in chunks to avoid payload limits
    const chunkSize = 50;
    for (let i = 0; i < insertData.length; i += chunkSize) {
      const chunk = insertData.slice(i, i + chunkSize);
      const { error } = await supabase.from('portfolio_documents').insert(chunk);
      if (error) {
        console.error('Error inserting chunk:', error);
        throw error;
      }
    }

    return NextResponse.json({ message: `Successfully indexed ${documents.length} documents using Gemini embeddings.` });

  } catch (error: any) {
    console.error('Indexing API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to rebuild index' }, { status: 500 });
  }
}
