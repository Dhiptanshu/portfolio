'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, X, MessageSquare, Send } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "Which projects use Flutter?",
  "Tell me about internships.",
  "Show AI projects.",
  "Summarize backend experience.",
  "Which hackathons were participated in?"
];

export function PortfolioAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, append } = useChat({
    api: '/api/chat',
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSuggest = (q: string) => {
    append({ role: 'user', content: q });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-xl flex items-center justify-center p-0 z-50 transition-transform hover:scale-110"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] flex flex-col shadow-2xl z-50 overflow-hidden border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 bg-muted/30">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bot className="w-4 h-4" />
          AI Portfolio Assistant
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground mt-8">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                <Bot className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">Ask me anything about this portfolio!</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-[250px]">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1.5 whitespace-normal text-left inline-block"
                    onClick={() => handleSuggest(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 text-sm ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                    <div className={`rounded-lg px-4 py-2 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 border shadow-sm'}`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-background/50 backdrop-blur">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question..."
              className="flex-1 bg-background"
            />
            <Button type="submit" size="icon" disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
