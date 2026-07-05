import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from('ai_settings').select('is_chat_enabled').eq('id', 1).single();
  return NextResponse.json({ is_chat_enabled: data?.is_chat_enabled ?? false });
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { is_chat_enabled } = await req.json();

    const { error } = await supabase
      .from('ai_settings')
      .update({ is_chat_enabled })
      .eq('id', 1);

    if (error) throw error;

    return NextResponse.json({ success: true, is_chat_enabled });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update setting' }, { status: 500 });
  }
}
