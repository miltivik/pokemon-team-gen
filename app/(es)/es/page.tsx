import type { Metadata } from "next";
import Link from "next/link";
import { getHomeCopy } from "@/lib/home-copy";

const SPANISH_DESCRIPTION =
  "Genera equipos Pokémon competitivos para Pokémon Showdown con datos del meta, sinergia de tipos, movimientos optimizados y exportación inmediata.";

export const metadata: Metadata = {
  title: "Generador de Equipos Pokémon Competitivos",
  description: SPANISH_DESCRIPTION,
  alternates: {
    canonical: "https://poketeambuilder.com/es",
    languages: {
      en: "https://poketeambuilder.com",
      es: "https://poketeambuilder.com/es",
      "x-default": "https://poketeambuilder.com",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: "en_US",
    url: "https://poketeambuilder.com/es",
    title: "Generador de Equipos Pokémon Competitivos",
    description: SPANISH_DESCRIPTION,
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Generador de Equipos Pokémon Competitivos",
    description: SPANISH_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function SpanishHomePage() {
  const t = getHomeCopy("es");

  return (
    <main lang="es" className="container mx-auto px-4 py-12 text-zinc-900 dark:text-zinc-50">
      <section className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
          {t("app.aiPowered")}
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
          {t("app.titleNew")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
          {t("app.subtitleNew")}
        </p>
        <Link
          href="/es/configurar"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-blue-600 px-8 font-bold text-white hover:bg-blue-700"
        >
          {t("app.startGeneratingNew")}
        </Link>
        <p className="mt-3 text-sm text-zinc-500">{t("app.freeNoReg")}</p>
      </section>

      <section className="mx-auto mt-16 max-w-5xl" aria-labelledby="funciones">
        <h2 id="funciones" className="text-center text-3xl font-black">
          {t("home.features.title")}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {([
            ["features.benefit1Title", "features.benefit1Desc"],
            ["features.benefit2Title", "features.benefit2Desc"],
            ["features.benefit3Title", "features.benefit3Desc"],
          ] as const).map(([title, description]) => (
            <article
              key={title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="text-xl font-bold">{t(title)}</h3>
              <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-300">
                {t(description)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-4xl rounded-3xl bg-zinc-100 p-8 dark:bg-zinc-900">
        <h2 className="text-3xl font-black">{t("about.howItWorks")}</h2>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          {t("about.howItWorksSubtitle")}
        </p>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {([
            ["about.step1Title", "about.step1Desc"],
            ["about.step2Title", "about.step2Desc"],
            ["about.step4Title", "about.step4Desc"],
          ] as const).map(([title, description], index) => (
            <li key={title}>
              <span className="text-sm font-bold text-blue-600">0{index + 1}</span>
              <h3 className="mt-2 text-lg font-bold">{t(title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {t(description)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-16 max-w-4xl text-center">
        <h2 className="text-3xl font-black">{t("home.bottomCtaTitle")}</h2>
        <p className="mt-4 text-zinc-600 dark:text-zinc-300">{t("home.bottomCtaDesc")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/es/configurar"
            className="rounded-full bg-blue-600 px-7 py-3 font-bold text-white hover:bg-blue-700"
          >
            {t("app.startGeneratingNew")}
          </Link>
          <Link
            href="/tier-list"
            className="rounded-full border border-zinc-300 px-7 py-3 font-bold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            {t("home.explore.tier")}
          </Link>
        </div>
      </section>
    </main>
  );
}
