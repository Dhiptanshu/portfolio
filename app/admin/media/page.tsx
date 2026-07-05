import { Button } from "@/components/ui/button";
import { MediaLibrary } from "@/features/admin/media-library";
import { getMediaAssets } from "@/lib/data";

export default async function MediaPage() {
  const assets = await getMediaAssets();
  return (
    <div>
      <h1 className="font-serif text-3xl">Media library</h1>
      <p className="mt-2 text-sm text-muted-foreground">Upload images, videos, and PDFs to Supabase Storage.</p>
      <form action="/api/media" method="post" encType="multipart/form-data" className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <input name="file" type="file" accept="image/*,video/*,application/pdf" className="text-sm" required />
        <Button type="submit">Upload</Button>
      </form>
      <MediaLibrary initialAssets={assets} />
    </div>
  );
}
