import { SocialManager } from "@/features/admin/simple-manager";
import { getSocials } from "@/lib/data";

export default async function SocialsPage() {
  const socials = await getSocials();
  return (
    <div>
      <h1 className="font-serif text-3xl">Social links</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage public profile links and their order.</p>
      <SocialManager initialItems={socials} />
    </div>
  );
}
