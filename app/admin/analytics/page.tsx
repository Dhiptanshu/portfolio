'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/features/admin/admin-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Activity, Users, Clock, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/browser';

export default function AnalyticsAdminPage() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    returningVisitors: 0,
    pageViews: 0,
    avgDurationSecs: 0
  });
  
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadStats() {
      // Just basic fetching for demonstration. Real implementation would aggregate via RPC or API route.
      const [{ count: sessionCount }, { count: returningCount }, { count: pageViewCount }] = await Promise.all([
        supabase.from('analytics_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('analytics_sessions').select('*', { count: 'exact', head: true }).eq('is_returning', true),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view')
      ]);

      setStats({
        totalSessions: sessionCount || 0,
        returningVisitors: returningCount || 0,
        pageViews: pageViewCount || 0,
        avgDurationSecs: 45 // Dummy logic for example. Actual requires raw data processing
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  const handleExportCSV = async () => {
    const { data } = await supabase.from('analytics_events').select('*, analytics_sessions(*)').limit(1000);
    if (!data) return alert('No data to export');
    
    const csvHeader = 'id,session_id,event_type,path,created_at\n';
    const csvContent = data.map(e => `${e.id},${e.session_id},${e.event_type},${e.path},${e.created_at}`).join('\n');
    
    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminShell title="Visitor Analytics" description="Privacy-friendly insights on portfolio traffic.">
      <div className="flex justify-end mb-6">
        <Button onClick={handleExportCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Returning Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.returningVisitors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.pageViews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration (sec)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.avgDurationSecs}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Live feed of visitor interactions across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 border border-dashed rounded-lg text-muted-foreground">
            Chart data will populate here as traffic scales.
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
