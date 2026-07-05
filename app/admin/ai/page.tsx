'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, RefreshCw, CheckCircle2, AlertCircle, Power } from 'lucide-react';
import { AdminShell } from '@/features/admin/admin-shell';

export default function AIAdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const [isChatEnabled, setIsChatEnabled] = useState(true);
  const [isSettingLoading, setIsSettingLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/ai-settings')
      .then(res => res.json())
      .then(data => {
        setIsChatEnabled(data.is_chat_enabled);
        setIsSettingLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleToggleChat = async () => {
    setIsSettingLoading(true);
    try {
      const res = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_chat_enabled: !isChatEnabled })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIsChatEnabled(data.is_chat_enabled);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle chat');
    } finally {
      setIsSettingLoading(false);
    }
  };

  const handleRebuildIndex = async () => {
    setIsLoading(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/admin/index-portfolio', {
        method: 'POST',
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to rebuild index');
      
      setStatus('success');
      setMessage(data.message || 'Successfully rebuilt the search index.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An error occurred while indexing.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminShell title="AI Assistant Configuration" description="Manage the RAG knowledge base and assistant settings.">
      <div className="max-w-3xl space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Power className="w-5 h-5" />
              Master Power Switch
            </CardTitle>
            <CardDescription>
              Instantly enable or completely vanish the AI Chat Assistant from the public portfolio. Use this if you need to manage API costs or perform maintenance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant={isChatEnabled ? 'destructive' : 'default'}
              onClick={handleToggleChat} 
              disabled={isSettingLoading}
            >
              {isSettingLoading ? 'Updating...' : (isChatEnabled ? 'Disable AI Chat (Vanish)' : 'Enable AI Chat')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Knowledge Base Indexing
            </CardTitle>
            <CardDescription>
              Rebuild the vector search index used by the AI Portfolio Assistant. This process parses all your visible projects, timeline journeys, skills, and achievements, generates Gemini embeddings, and stores them in the database for semantic search.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleRebuildIndex} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Indexing...' : 'Rebuild Index Now'}
              </Button>
            </div>
            
            {status === 'success' && (
              <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 p-3 rounded-md">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <p>{message}</p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
