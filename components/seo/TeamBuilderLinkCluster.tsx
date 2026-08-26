import Link from "next/link";
import { TEAM_BUILDER_LANDING_LINKS } from "@/config/team-builder-landings";

export function TeamBuilderLinkCluster({ excludePathname }: { excludePathname?: string }) {
  const links = TEAM_BUILDER_LANDING_LINKS.filter((link) => link.pathname !== excludePathname);

  return (
    <section
      aria-labelledby="team-builder-journeys-heading"
      className="w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 id="team-builder-journeys-heading" className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Choose a team-building path
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Start with the format or archetype that matches your next Pokemon Showdown team, then open the builder with the right context.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.pathname}
            href={link.pathname}
            className="rounded-xl border border-zinc-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
          >
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{link.label}</span>
            <span className="mt-1 block text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{link.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
