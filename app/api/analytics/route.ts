import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import crypto from 'crypto';

function getVisitorHash(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  // Salt with current date so it rotates daily (privacy friendly)
  const salt = new Date().toISOString().split('T')[0];
  return crypto.createHash('sha256').update(`${ip}-${userAgent}-${salt}`).digest('hex');
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase client not initialized");
    const body = await req.json();
    const { action, event_type, path, resource_id, resource_name, metadata, session_id } = body;
    const visitor_hash = getVisitorHash(req);

    if (action === 'init_session') {
      // Check if visitor hash exists today
      const { data: existing } = await supabase
        .from('analytics_sessions')
        .select('id, start_time')
        .eq('visitor_hash', visitor_hash)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        return NextResponse.json({ session_id: existing.id });
      }

      // Check if they are returning (hash from a previous day? We rotate daily, so we can't easily check past days with just the date salt. 
      // Instead, we can use a long-lived local storage flag passed from client `is_returning`)
      const { data: session, error } = await supabase
        .from('analytics_sessions')
        .insert({
          visitor_hash,
          user_agent: req.headers.get('user-agent'),
          is_returning: body.is_returning || false,
        })
        .select('id')
        .single();

      if (error) throw error;
      return NextResponse.json({ session_id: session.id });
    }

    if (action === 'ping' && session_id) {
      await supabase
        .from('analytics_sessions')
        .update({ last_ping: new Date().toISOString() })
        .eq('id', session_id);
      return NextResponse.json({ success: true });
    }

    if (action === 'event' && session_id) {
      await supabase.from('analytics_events').insert({
        session_id,
        event_type,
        path,
        resource_id,
        resource_name,
        metadata: metadata || {}
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
