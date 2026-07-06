'use client';

import { useState, useEffect } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Briefcase, Save } from 'lucide-react';

export default function RecruiterAdminPage() {
  const [readingTime, setReadingTime] = useState(5);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/recruiter-settings')
      .then(r => r.json())
      .then(d => {
        if (d.estimated_reading_time) setReadingTime(d.estimated_reading_time);
        if (d.is_active !== undefined) setIsActive(d.is_active);
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recruiter-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimated_reading_time: readingTime, is_active: isActive }),
      });
      if (!res.ok) throw new Error('Failed to save');
      alert('Settings saved successfully!');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell title="Recruiter Mode Configuration" description="Manage the guided tour experience for recruiters.">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure the estimated reading time for the guided tour and toggle the overall availability of the mode. Note: Featured flags for projects, skills, etc., can be toggled on their respective admin pages.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Reading Time (minutes)</label>
              <Input 
                type="number" 
                value={readingTime} 
                onChange={(e) => setReadingTime(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2 flex flex-col mt-4">
              <label className="text-sm font-medium">Mode Status</label>
              <Button 
                variant={isActive ? 'default' : 'secondary'} 
                onClick={() => setIsActive(!isActive)}
                className="w-fit"
              >
                {isActive ? 'Active (Visible on Site)' : 'Hidden'}
              </Button>
            </div>

            <Button onClick={handleSave} disabled={loading} className="mt-4 gap-2">
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
