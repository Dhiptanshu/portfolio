'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Theme } from '@/features/theme/theme-context';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function ThemeAdminPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [editingVariables, setEditingVariables] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    loadThemes();
  }, []);

  async function loadThemes() {
    const { data } = await supabase.from('themes').select('*').order('created_at');
    if (data) {
      setThemes(data);
      if (data.length > 0 && !activeThemeId) {
        handleSelectTheme(data[0]);
      }
    }
  }

  const handleSelectTheme = (theme: Theme) => {
    setActiveThemeId(theme.id);
    setEditingVariables(theme.variables);
  };

  const handleSave = async () => {
    if (!activeThemeId) return;
    setSaving(true);
    await supabase.from('themes').update({ variables: editingVariables, updated_at: new Date().toISOString() }).eq('id', activeThemeId);
    await loadThemes();
    setSaving(false);
    alert('Theme saved successfully! Hard refresh the main site to see changes.');
  };

  const handleChange = (key: string, value: string) => {
    setEditingVariables(prev => ({ ...prev, [key]: value }));
    
    // Live preview by updating CSS variable directly on root
    document.documentElement.style.setProperty(`--${key}`, value);
  };

  const activeTheme = themes.find(t => t.id === activeThemeId);

  return (
    <AdminShell title="Theme Engine" description="Configure visual properties, colors, and aesthetics dynamically.">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Available Themes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {themes.map(theme => (
                <Button 
                  key={theme.id} 
                  variant={theme.id === activeThemeId ? 'default' : 'outline'} 
                  className="w-full justify-start"
                  onClick={() => handleSelectTheme(theme)}
                >
                  {theme.name}
                </Button>
              ))}
              <Button variant="ghost" className="w-full justify-start border-dashed border mt-4 text-muted-foreground gap-2">
                <Plus className="w-4 h-4" /> New Theme
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {activeTheme ? (
            <Card>
              <CardHeader>
                <CardTitle>Editing: {activeTheme.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(editingVariables).map(key => (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize">{key.replace('-', ' ')}</label>
                      <Input 
                        value={editingVariables[key] || ''} 
                        onChange={(e) => handleChange(key, e.target.value)} 
                        placeholder="e.g. 222 47% 11%"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
              <div className="flex justify-end gap-3 border-t mt-4 pt-4 px-6 pb-6">
                <Button variant="outline" className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4 mr-2"/> Delete</Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Card>
          ) : (
             <div className="text-center text-muted-foreground mt-12">Select a theme to edit its properties.</div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
