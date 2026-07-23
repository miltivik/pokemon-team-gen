import { type Lang, translateFromMap } from "@/lib/i18n-shared";

type HomeCopyKey =
    | "app.skipToContent"
    | "app.aiPowered"
    | "app.titleNew"
    | "app.subtitleNew"
    | "app.startGeneratingNew"
    | "app.freeNoReg"
    | "about.howItWorks"
    | "about.howItWorksSubtitle"
    | "about.step1Title"
    | "about.step1Desc"
    | "about.step2Title"
    | "about.step2Desc"
    | "about.step4Title"
    | "about.step4Desc"
    | "features.benefit1Title"
    | "features.benefit1Desc"
    | "features.benefit2Title"
    | "features.benefit2Desc"
    | "features.benefit3Title"
    | "features.benefit3Desc"
    | "features.supportedFormats"
    | "home.bottomCtaTitle"
    | "home.bottomCtaDesc"
    | "home.demoTitle"
    | "home.demoDesc"
    | "home.explore.about"
    | "home.explore.aboutDesc"
    | "home.explore.guides"
    | "home.explore.guidesDesc"
    | "home.explore.tier"
    | "home.explore.tierDesc"
    | "home.explore.labelAbout"
    | "home.explore.labelGuides"
    | "home.explore.labelTier"
    | "home.explore.title"
    | "home.features.title"
    | "home.heroAccentTitle"
    | "home.heroAccentFormats"
    | "home.heroAccentMeta"
    | "home.heroAccentExport"
    | "home.heroAccentFormatsValue"
    | "home.heroAccentMetaValue"
    | "home.heroAccentExportValue"
    | "home.trending"
    | "home.trendingSubtitle"
    | "team.rainTeam";

const homeCopy: Record<Lang, Record<HomeCopyKey, string>> = {
    en: {
        "app.skipToContent": "Skip to main content",
        "app.aiPowered": "Data-driven generation",
        "app.titleNew": "Competitive Pokemon Team Generator, Built with Meta Data",
        "app.subtitleNew": "We analyze the current Smogon and VGC meta to generate synergistic, balanced teams ready to export to Pokemon Showdown.",
        "app.startGeneratingNew": "Generate My First Team",
        "app.freeNoReg": "Its free. No registration required.",
        "about.howItWorks": "How It Works",
        "about.howItWorksSubtitle": "Three simple steps to get a battle-ready competitive team.",
        "about.step1Title": "Choose Your Format",
        "about.step1Desc": "Select Gen 9 OU, VGC, UU, or any other supported format.",
        "about.step2Title": "Pick Your Style",
        "about.step2Desc": "Choose a playstyle like Bulky Offense, Hyper Offense, Rain, or more.",
        "about.step4Title": "Export and Play",
        "about.step4Desc": "Copy to Pokemon Showdown and start climbing the ladder.",
        "features.benefit1Title": "Real-Time Meta Analysis",
        "features.benefit1Desc": "We integrate data from Smogon and Pikalytics so your team can answer the most popular threats.",
        "features.benefit2Title": "Perfect Synergy Guaranteed",
        "features.benefit2Desc": "The builder checks weaknesses, resistances, and role overlap to avoid critical structural holes.",
        "features.benefit3Title": "Ready for Battle",
        "features.benefit3Desc": "Get the exact format to copy and paste directly into Pokemon Showdown in one click.",
        "features.supportedFormats": "Supported Formats",
        "home.bottomCtaTitle": "Ready to dominate the ladder?",
        "home.bottomCtaDesc": "Join thousands of players who are already creating battle-ready teams in seconds.",
        "home.demoTitle": "Live Demo",
        "home.demoDesc": "A quick look at the kind of meta-ready teams you can generate in one click.",
        "home.explore.about": "About",
        "home.explore.aboutDesc": "How the builder works and what it supports.",
        "home.explore.guides": "Strategy Guides",
        "home.explore.guidesDesc": "Meta advice, structures, and matchup tips.",
        "home.explore.labelAbout": "About",
        "home.explore.labelGuides": "Guide",
        "home.explore.labelTier": "Tier",
        "home.explore.tier": "Tier List",
        "home.explore.tierDesc": "Viability snapshots for the current formats.",
        "home.explore.title": "Explore",
        "home.features.title": "Features",
        "home.heroAccentTitle": "Meta-aware teams without the setup drag.",
        "home.heroAccentFormats": "Formats",
        "home.heroAccentMeta": "Meta-ready",
        "home.heroAccentExport": "Showdown export",
        "home.heroAccentFormatsValue": "12+",
        "home.heroAccentMetaValue": "Daily",
        "home.heroAccentExportValue": "1-click",
        "home.trending": "Trending Teams",
        "home.trendingSubtitle": "Battle-ready teams based on the most successful archetypes.",
        "team.rainTeam": "Rain Team",
    },
    es: {
        "app.skipToContent": "Saltar al contenido principal",
        "app.aiPowered": "Generación basada en datos",
        "app.titleNew": "Generador de equipos Pokémon competitivos, basado en datos del meta",
        "app.subtitleNew": "Analizamos el meta actual de Smogon y VGC para generar equipos sinérgicos, equilibrados y listos para exportar a Pokémon Showdown.",
        "app.startGeneratingNew": "Generar mi primer equipo",
        "app.freeNoReg": "Es gratis. Sin registro.",
        "about.howItWorks": "Cómo funciona",
        "about.howItWorksSubtitle": "Tres pasos simples para obtener un equipo competitivo listo para la batalla.",
        "about.step1Title": "Elige tu formato",
        "about.step1Desc": "Selecciona Gen 9 OU, VGC, UU o cualquier otro formato soportado.",
        "about.step2Title": "Elige tu estilo",
        "about.step2Desc": "Escoge un estilo como Ofensiva Masiva, Hiper Ofensiva, Lluvia y más.",
        "about.step4Title": "Exporta y juega",
        "about.step4Desc": "Copia el equipo a Pokémon Showdown y empieza a subir en el ranking.",
        "features.benefit1Title": "Análisis del meta en tiempo real",
        "features.benefit1Desc": "Integramos datos de Smogon y Pikalytics para que tu equipo pueda responder a las amenazas más populares.",
        "features.benefit2Title": "Sinergia perfecta garantizada",
        "features.benefit2Desc": "El generador revisa debilidades, resistencias y superposición de roles para evitar huecos críticos.",
        "features.benefit3Title": "Listo para pelear",
        "features.benefit3Desc": "Obtienes el formato exacto para copiar y pegar directamente en Pokémon Showdown con un clic.",
        "features.supportedFormats": "Formatos soportados",
        "home.bottomCtaTitle": "¿Listo para dominar el ranking?",
        "home.bottomCtaDesc": "Únete a miles de jugadores que ya están creando equipos listos para competir en segundos.",
        "home.demoTitle": "Demo en vivo",
        "home.demoDesc": "Un vistazo rápido al tipo de equipos listos para el meta que puedes generar con un clic.",
        "home.explore.about": "Acerca del proyecto",
        "home.explore.aboutDesc": "Cómo funciona el generador y qué formatos soporta.",
        "home.explore.guides": "Guías estratégicas",
        "home.explore.guidesDesc": "Consejos de meta, estructuras y planes de juego.",
        "home.explore.labelAbout": "Acerca",
        "home.explore.labelGuides": "Guía",
        "home.explore.labelTier": "Tier",
        "home.explore.tier": "Lista de Tier",
        "home.explore.tierDesc": "Una vista rápida de viabilidad en los formatos actuales.",
        "home.explore.title": "Explorar",
        "home.features.title": "Funciones",
        "home.heroAccentTitle": "Equipos listos para el meta, sin la fricción del setup.",
        "home.heroAccentFormats": "Formatos",
        "home.heroAccentMeta": "Meta listo",
        "home.heroAccentExport": "Exportación",
        "home.heroAccentFormatsValue": "12+",
        "home.heroAccentMetaValue": "Diario",
        "home.heroAccentExportValue": "1 clic",
        "home.trending": "Equipos en tendencia",
        "home.trendingSubtitle": "Equipos listos para jugar basados en los arquetipos con mejor rendimiento.",
        "team.rainTeam": "Equipo de lluvia",
    },
};

export function getHomeCopy(lang: Lang) {
    return function t(key: HomeCopyKey) {
        return translateFromMap(homeCopy, lang, key);
    };
}
