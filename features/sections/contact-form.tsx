"use client";

import { useState } from "react";
import { Send, Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      role: formData.get("role") as string,
      region: formData.get("region") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
      linkedin: formData.get("linkedin") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        if (typeof json.error === "object" && json.error !== null) {
           const fieldErrors = json.error.fieldErrors;
           if (fieldErrors) {
             const firstKey = Object.keys(fieldErrors)[0];
             throw new Error(fieldErrors[firstKey]?.[0] || "Validation failed");
           }
           throw new Error(JSON.stringify(json.error));
        }
        throw new Error(json.error || "Failed to send message");
      }

      toast.success("Message sent successfully! I'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rpg-panel bg-card p-6 flex flex-col gap-4">
      <h3 className="font-bold text-xl uppercase tracking-widest text-primary border-b-4 border-border/20 pb-3">
        Send a Message
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name *</label>
          <Input name="name" required placeholder="Aarav Sharma" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address *</label>
          <Input type="email" name="email" required placeholder="aarav@example.com" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Company</label>
          <Input name="company" placeholder="Tata Consultancy Services" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Role *</label>
          <Input name="role" required placeholder="Recruiter, Engineer, etc." />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Region *</label>
          <Input name="region" required placeholder="Bengaluru, India" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">LinkedIn URL</label>
          <Input type="url" name="linkedin" placeholder="https://linkedin.com/in/..." />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject *</label>
        <Input name="subject" required placeholder="Job Opportunity, Networking, etc." />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Message *</label>
        <Textarea name="message" required placeholder="Write your message here..." className="min-h-[120px] resize-y" />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Paperclip className="w-3 h-3" /> Attachment (Optional, max 5MB)
        </label>
        <Input type="file" name="attachment" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" className="cursor-pointer" />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 text-lg tracking-widest font-bold uppercase">
        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
        {loading ? "Sending..." : "Submit Message"}
      </Button>
    </form>
  );
}
