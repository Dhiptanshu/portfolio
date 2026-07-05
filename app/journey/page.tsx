import { EmptyState } from "@/components/empty-state";
import { PublicJourneyTimeline } from "@/features/journey/public-journey-timeline";
import { getJourneyFilters, getJourneys } from "@/lib/data";

export default async function JourneyPage() {
  const [journeys, filters] = await Promise.all([getJourneys(), getJourneyFilters()]);

  if (journeys.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <EmptyState title="No journey entries yet" description="Publish journey entries from the admin dashboard to activate the timeline." />
      </main>
    );
  }

  return <PublicJourneyTimeline journeys={journeys} categories={filters.categories} tags={filters.tags} />;
}
