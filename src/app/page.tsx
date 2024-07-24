import { HydrateClient } from "@/trpc/server";
import Recommendation from "@/components/recommendation";
import Flow from "@/components/flow";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Recommendation />
      </main>
    </HydrateClient>
  );
}
