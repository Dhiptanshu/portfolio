"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Inbox, CheckCircle, Archive, Trash2, Mail, ExternalLink, Paperclip, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ContactMessage } from "@/lib/types";

export function MessagesAdmin({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [selectedId, setSelectedId] = useState<string | null>(initialMessages[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const selectedMessage = messages.find(m => m.id === selectedId) || null;

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(search.toLowerCase()) || 
      msg.email.toLowerCase().includes(search.toLowerCase()) || 
      msg.subject.toLowerCase().includes(search.toLowerCase()) ||
      (msg.company && msg.company.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function updateStatus(id: string, status: ContactMessage['status']) {
    const res = await fetch("/api/contact-messages", { method: "PATCH", body: JSON.stringify({ id, status }) });
    if (!res.ok) return toast.error("Failed to update status");
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, status } : m));
    toast.success(`Marked as ${status}`);
  }

  async function updateNotes(id: string, internal_notes: string) {
    const res = await fetch("/api/contact-messages", { method: "PATCH", body: JSON.stringify({ id, internal_notes }) });
    if (!res.ok) return toast.error("Failed to save notes");
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, internal_notes } : m));
    toast.success("Notes saved");
  }

  async function deleteMessage(id: string) {
    if (!confirm("Are you sure you want to delete this message?")) return;
    const res = await fetch("/api/contact-messages", { method: "DELETE", body: JSON.stringify({ id }) });
    if (!res.ok) return toast.error("Failed to delete message");
    setMessages(msgs => msgs.filter(m => m.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast.success("Message deleted");
  }

  const recruitersCount = messages.filter(m => m.role?.toLowerCase().includes("recruiter") || m.role?.toLowerCase().includes("talent")).length;
  const companiesCount = new Set(messages.map(m => m.company).filter(Boolean)).size;
  const regionsCount = new Set(messages.map(m => m.region).filter(Boolean)).size;

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Stat label="Total" value={messages.length.toString()} />
        <Stat label="Unread" value={messages.filter(m => m.status === 'unread').length.toString()} />
        <Stat label="Recruiters" value={recruitersCount.toString()} />
        <Stat label="Companies" value={companiesCount.toString()} />
        <Stat label="Regions" value={regionsCount.toString()} />
        <Stat label="Archived" value={messages.filter(m => m.status === 'archived').length.toString()} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {/* Inbox List */}
        <aside className="grid max-h-[720px] gap-4 overflow-auto rounded-lg border border-border bg-card p-4">
          <div className="grid gap-3">
            <Input placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="grid gap-2 mt-2">
            {filteredMessages.map(msg => (
              <button 
                key={msg.id} 
                onClick={() => {
                  setSelectedId(msg.id);
                  if (msg.status === 'unread') updateStatus(msg.id, 'read');
                }}
                className={`text-left p-3 rounded-md border transition-colors ${selectedId === msg.id ? 'border-primary bg-secondary' : 'border-border hover:bg-secondary/50'} ${msg.status === 'unread' ? 'border-l-4 border-l-primary' : ''}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`truncate text-sm ${msg.status === 'unread' ? 'font-bold text-primary' : 'font-medium'}`}>{msg.name}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{format(new Date(msg.created_at), "MMM d")}</span>
                </div>
                <p className="text-xs font-bold truncate mb-1">{msg.subject}</p>
                <p className="text-[10px] text-muted-foreground truncate">{msg.company ? `${msg.company} • ` : ''}{msg.message}</p>
              </button>
            ))}
            {filteredMessages.length === 0 && <div className="text-center text-muted-foreground p-4 text-sm">No messages found.</div>}
          </div>
        </aside>

        {/* Message Viewer */}
        <main className="min-h-[720px] rounded-lg border border-border bg-background p-0 overflow-hidden flex flex-col">
          {selectedMessage ? (
            <>
              {/* Header */}
              <div className="border-b border-border p-6 bg-card flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif mb-1">{selectedMessage.subject}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">{selectedMessage.name}</span>
                    <a href={`mailto:${selectedMessage.email}`} className="hover:text-primary transition-colors flex items-center gap-1"><Mail className="w-3 h-3" /> {selectedMessage.email}</a>
                    {selectedMessage.company && <span>• {selectedMessage.role} at <span className="font-bold">{selectedMessage.company}</span></span>}
                    {selectedMessage.region && <span>• {selectedMessage.region}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium uppercase tracking-wider" 
                    value={selectedMessage.status} 
                    onChange={e => updateStatus(selectedMessage.id, e.target.value as ContactMessage['status'])}
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                  <Button variant="outline" size="icon" onClick={() => updateStatus(selectedMessage.id, 'archived')} title="Archive"><Archive className="w-4 h-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => deleteMessage(selectedMessage.id)} title="Delete"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-auto p-6 grid lg:grid-cols-[1fr_300px] gap-8">
                <div className="space-y-6">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </div>
                  
                  {/* Attachments & Links */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
                    {selectedMessage.linkedin && (
                      <a href={selectedMessage.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-secondary px-3 py-2 rounded-md hover:bg-primary/20 transition-colors">
                        <ExternalLink className="w-4 h-4" /> LinkedIn Profile
                      </a>
                    )}
                    {selectedMessage.attachment_url && (
                      <a href={selectedMessage.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-secondary px-3 py-2 rounded-md hover:bg-primary/20 transition-colors">
                        <Paperclip className="w-4 h-4" /> View Attachment
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Sidebar CRM Info */}
                <div className="space-y-6 border-l border-border pl-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="w-3 h-3" /> Internal CRM Notes
                    </label>
                    <Textarea 
                      placeholder="Add notes about this contact..." 
                      className="min-h-[150px] text-sm resize-none bg-secondary/50 focus:bg-background transition-colors"
                      defaultValue={selectedMessage.internal_notes || ""}
                      onBlur={e => updateNotes(selectedMessage.id, e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">Notes auto-save when you click away.</p>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t border-border">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">System Metadata</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-muted-foreground">Received:</span>
                      <span className="text-right">{format(new Date(selectedMessage.created_at), "MMM d, yyyy h:mm a")}</span>
                      <span className="text-muted-foreground">Spam Score:</span>
                      <span className="text-right">{selectedMessage.is_spam ? <span className="text-destructive font-bold">Flagged</span> : <span className="text-primary font-bold">Clean</span>}</span>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-right capitalize">{selectedMessage.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Inbox className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a message to view details</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{label}</p>
      <p className="mt-1 text-3xl font-serif text-primary">{value}</p>
    </div>
  );
}
