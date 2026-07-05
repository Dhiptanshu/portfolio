"use client";

import { Bold, Heading2, Image, Link, List, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownView } from "@/components/markdown-view";

export function MarkdownEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  function insert(snippet: string) {
    onChange(value ? `${value}\n${snippet}` : snippet);
  }

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-background p-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="icon" onClick={() => insert("## Section")} aria-label="Heading"><Heading2 className="h-4 w-4" /></Button>
        <Button type="button" variant="outline" size="icon" onClick={() => insert("**Important text**")} aria-label="Bold"><Bold className="h-4 w-4" /></Button>
        <Button type="button" variant="outline" size="icon" onClick={() => insert("- List item")} aria-label="List"><List className="h-4 w-4" /></Button>
        <Button type="button" variant="outline" size="icon" onClick={() => insert("> Quote")} aria-label="Quote"><Quote className="h-4 w-4" /></Button>
        <Button type="button" variant="outline" size="icon" onClick={() => insert("[Link](https://example.com)")} aria-label="Link"><Link className="h-4 w-4" /></Button>
        <Button type="button" variant="outline" size="icon" onClick={() => insert("![Image](https://example.com/image.jpg)")} aria-label="Image"><Image className="h-4 w-4" /></Button>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Textarea className="min-h-72" value={value} onChange={(event) => onChange(event.target.value)} />
        <div className="min-h-72 rounded-md border border-border bg-card p-4">
          <MarkdownView value={value} />
        </div>
      </div>
    </div>
  );
}
