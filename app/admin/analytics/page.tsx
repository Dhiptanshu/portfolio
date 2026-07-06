'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Activity, Users, Clock, Eye, MousePointerClick } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export default function AnalyticsAdminPage() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    returningVisitors: 0,
    pageViews: 0,
    avgDurationSecs: 0
  });
  const [events, setEvents] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const days = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 7;
      const startDate = subDays(new Date(), days).toISOString();

      const [
        { data: sessionData, count: sessionCount }, 
        { count: returningCount }, 
        { data: eventData, count: pageViewCount }
      ] = await Promise.all([
        supabase.from('analytics_sessions').select('id, start_time, last_ping', { count: 'exact' }).gte('start_time', startDate),
        supabase.from('analytics_sessions').select('*', { count: 'exact', head: true }).eq('is_returning', true).gte('start_time', startDate),
        supabase.from('analytics_events').select('*', { count: 'exact' }).gte('created_at', startDate).order('created_at', { ascending: false })
      ]);

      // Calculate avg duration
      let totalDuration = 0;
      if (sessionData && sessionData.length > 0) {
        sessionData.forEach(s => {
          const start = new Date(s.start_time).getTime();
          const end = new Date(s.last_ping).getTime();
          if (end > start) {
            totalDuration += (end - start) / 1000;
          }
        });
      }

      setStats({
        totalSessions: sessionCount || 0,
        returningVisitors: returningCount || 0,
        pageViews: eventData?.filter(e => e.event_type === 'page_view').length || 0,
        avgDurationSecs: sessionCount && sessionCount > 0 ? Math.round(totalDuration / sessionCount) : 0
      });
      
      setEvents((eventData || []).slice(0, 50)); // Top 50 recent events

      // Chart Data grouping by day
      const groupedData: Record<string, { date: string, page_views: number, sessions: number }> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'MMM dd');
        groupedData[d] = { date: d, page_views: 0, sessions: 0 };
      }

      sessionData?.forEach(s => {
        const dateKey = format(new Date(s.start_time), 'MMM dd');
        if (groupedData[dateKey]) groupedData[dateKey].sessions += 1;
      });

      eventData?.forEach(e => {
        if (e.event_type === 'page_view') {
          const dateKey = format(new Date(e.created_at), 'MMM dd');
          if (groupedData[dateKey]) groupedData[dateKey].page_views += 1;
        }
      });

      setChartData(Object.values(groupedData));
      setLoading(false);
    }
    
    loadStats();
  }, [timeRange]);

  const handleExportCSV = async () => {
    const { data } = await supabase.from('analytics_events').select('*, analytics_sessions(*)').limit(5000).order('created_at', { ascending: false });
    if (!data || data.length === 0) return alert('No data to export');
    
    const csvHeader = 'id,session_id,event_type,path,resource_name,created_at\n';
    const csvContent = data.map(e => `${e.id},${e.session_id},${e.event_type},${e.path},"${e.resource_name || ''}",${e.created_at}`).join('\n');
    
    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminShell title="Visitor Analytics" description="Privacy-friendly insights on portfolio traffic.">
      <div className="flex items-center justify-between mb-6">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={handleExportCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
               <Users className="w-4 h-4" /> Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '-' : stats.totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="w-4 h-4" /> Page Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '-' : stats.pageViews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '-' : `${Math.floor(stats.avgDurationSecs / 60)}m ${stats.avgDurationSecs % 60}s`}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" /> Returning Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '-' : stats.returningVisitors}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Traffic Overview</CardTitle>
            <CardDescription>Page views and unique sessions over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="page_views" name="Page Views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="sessions" name="Sessions" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest visitor events.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {loading ? (
                <div className="text-sm text-muted-foreground text-center mt-8">Loading events...</div>
              ) : events.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center mt-8">No recent activity found.</div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                    <div className="mt-0.5 bg-muted p-1.5 rounded-md text-foreground">
                      {event.event_type === 'page_view' ? <Eye className="w-3 h-3" /> : <MousePointerClick className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {event.event_type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground flex justify-between items-center w-full">
                        <span className="truncate max-w-[150px]">{event.resource_name || event.path}</span>
                        <span className="ml-2">{format(new Date(event.created_at), 'HH:mm')}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
