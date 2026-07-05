"use client";

import { useState } from "react";
import { Copy, FileText, ImageIcon, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaAsset } from "@/lib/types";

export function MediaLibrary({ initialAssets }: { initialAssets: MediaAsset[] }) {
  const [assets, setAssets] = useState(initialAssets);

  async function remove(asset: MediaAsset) {
    const form = new FormData();
    form.set("_method", "DELETE");
    form.set("id", asset.id);
    const response = await fetch("/api/media", { method: "POST", body: form });
    if (response.ok || response.redirected) setAssets(assets.filter((item) => item.id !== asset.id));
  }

  return (
    <div className="mt-6 grid gap-3">
      {assets.map((asset) => {
        const Icon = asset.mime_type.startsWith("image/") ? ImageIcon : asset.mime_type.startsWith("video/") ? Video : FileText;
        return (
          <div key={asset.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex min-w-0 items-center gap-3">
              <Icon className="h-5 w-5 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{asset.file_name}</p>
                <a href={asset.public_url} target="_blank" rel="noreferrer" className="block truncate text-xs text-muted-foreground">{asset.public_url}</a>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(asset.public_url)} aria-label="Copy URL"><Copy className="h-4 w-4" /></Button>
              <Button variant="destructive" size="icon" onClick={() => remove(asset)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
