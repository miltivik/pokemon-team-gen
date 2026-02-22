export const typeColors: Record<string, {
    bg: string;
    border: string;
    text: string;
    ring: string;
    gradientFrom: string;
    gradientTo: string;
    hoverBorder: string;
    decoration: string;
    shadow: string;
}> = {
    normal: {
        bg: "bg-zinc-400",
        border: "border-zinc-400",
        text: "text-zinc-400",
        ring: "ring-zinc-400",
        gradientFrom: "from-zinc-400",
        gradientTo: "to-zinc-400",
        hoverBorder: "group-hover:border-zinc-400",
        decoration: "decoration-zinc-400/50",
        shadow: "shadow-zinc-400/20"
    },
    fire: {
        bg: "bg-orange-500",
        border: "border-orange-500",
        text: "text-orange-500",
        ring: "ring-orange-500",
        gradientFrom: "from-orange-500",
        gradientTo: "to-orange-500",
        hoverBorder: "group-hover:border-orange-500",
        decoration: "decoration-orange-500/50",
        shadow: "shadow-orange-500/20"
    },
    water: {
        bg: "bg-blue-500",
        border: "border-blue-500",
        text: "text-blue-500",
        ring: "ring-blue-500",
        gradientFrom: "from-blue-500",
        gradientTo: "to-blue-500",
        hoverBorder: "group-hover:border-blue-500",
        decoration: "decoration-blue-500/50",
        shadow: "shadow-blue-500/20"
    },
    grass: {
        bg: "bg-green-500",
        border: "border-green-500",
        text: "text-green-500",
        ring: "ring-green-500",
        gradientFrom: "from-green-500",
        gradientTo: "to-green-500",
        hoverBorder: "group-hover:border-green-500",
        decoration: "decoration-green-500/50",
        shadow: "shadow-green-500/20"
    },
    electric: {
        bg: "bg-yellow-400",
        border: "border-yellow-400",
        text: "text-yellow-400",
        ring: "ring-yellow-400",
        gradientFrom: "from-yellow-400",
        gradientTo: "to-yellow-400",
        hoverBorder: "group-hover:border-yellow-400",
        decoration: "decoration-yellow-400/50",
        shadow: "shadow-yellow-400/20"
    },
    ice: {
        bg: "bg-cyan-300",
        border: "border-cyan-300",
        text: "text-cyan-300",
        ring: "ring-cyan-300",
        gradientFrom: "from-cyan-300",
        gradientTo: "to-cyan-300",
        hoverBorder: "group-hover:border-cyan-300",
        decoration: "decoration-cyan-300/50",
        shadow: "shadow-cyan-300/20"
    },
    fighting: {
        bg: "bg-red-600",
        border: "border-red-600",
        text: "text-red-600",
        ring: "ring-red-600",
        gradientFrom: "from-red-600",
        gradientTo: "to-red-600",
        hoverBorder: "group-hover:border-red-600",
        decoration: "decoration-red-600/50",
        shadow: "shadow-red-600/20"
    },
    poison: {
        bg: "bg-purple-500",
        border: "border-purple-500",
        text: "text-purple-500",
        ring: "ring-purple-500",
        gradientFrom: "from-purple-500",
        gradientTo: "to-purple-500",
        hoverBorder: "group-hover:border-purple-500",
        decoration: "decoration-purple-500/50",
        shadow: "shadow-purple-500/20"
    },
    ground: {
        bg: "bg-amber-600",
        border: "border-amber-600",
        text: "text-amber-600",
        ring: "ring-amber-600",
        gradientFrom: "from-amber-600",
        gradientTo: "to-amber-600",
        hoverBorder: "group-hover:border-amber-600",
        decoration: "decoration-amber-600/50",
        shadow: "shadow-amber-600/20"
    },
    flying: {
        bg: "bg-indigo-300",
        border: "border-indigo-300",
        text: "text-indigo-300",
        ring: "ring-indigo-300",
        gradientFrom: "from-indigo-300",
        gradientTo: "to-indigo-300",
        hoverBorder: "group-hover:border-indigo-300",
        decoration: "decoration-indigo-300/50",
        shadow: "shadow-indigo-300/20"
    },
    psychic: {
        bg: "bg-pink-500",
        border: "border-pink-500",
        text: "text-pink-500",
        ring: "ring-pink-500",
        gradientFrom: "from-pink-500",
        gradientTo: "to-pink-500",
        hoverBorder: "group-hover:border-pink-500",
        decoration: "decoration-pink-500/50",
        shadow: "shadow-pink-500/20"
    },
    bug: {
        bg: "bg-lime-500",
        border: "border-lime-500",
        text: "text-lime-500",
        ring: "ring-lime-500",
        gradientFrom: "from-lime-500",
        gradientTo: "to-lime-500",
        hoverBorder: "group-hover:border-lime-500",
        decoration: "decoration-lime-500/50",
        shadow: "shadow-lime-500/20"
    },
    rock: {
        bg: "bg-stone-500",
        border: "border-stone-500",
        text: "text-stone-500",
        ring: "ring-stone-500",
        gradientFrom: "from-stone-500",
        gradientTo: "to-stone-500",
        hoverBorder: "group-hover:border-stone-500",
        decoration: "decoration-stone-500/50",
        shadow: "shadow-stone-500/20"
    },
    ghost: {
        bg: "bg-purple-700",
        border: "border-purple-700",
        text: "text-purple-700",
        ring: "ring-purple-700",
        gradientFrom: "from-purple-700",
        gradientTo: "to-purple-700",
        hoverBorder: "group-hover:border-purple-700",
        decoration: "decoration-purple-700/50",
        shadow: "shadow-purple-700/20"
    },
    dragon: {
        bg: "bg-violet-600",
        border: "border-violet-600",
        text: "text-violet-600",
        ring: "ring-violet-600",
        gradientFrom: "from-violet-600",
        gradientTo: "to-violet-600",
        hoverBorder: "group-hover:border-violet-600",
        decoration: "decoration-violet-600/50",
        shadow: "shadow-violet-600/20"
    },
    steel: {
        bg: "bg-slate-400",
        border: "border-slate-400",
        text: "text-slate-400",
        ring: "ring-slate-400",
        gradientFrom: "from-slate-400",
        gradientTo: "to-slate-400",
        hoverBorder: "group-hover:border-slate-400",
        decoration: "decoration-slate-400/50",
        shadow: "shadow-slate-400/20"
    },
    fairy: {
        bg: "bg-pink-300",
        border: "border-pink-300",
        text: "text-pink-300",
        ring: "ring-pink-300",
        gradientFrom: "from-pink-300",
        gradientTo: "to-pink-300",
        hoverBorder: "group-hover:border-pink-300",
        decoration: "decoration-pink-300/50",
        shadow: "shadow-pink-300/20"
    },
    dark: {
        bg: "bg-zinc-700",
        border: "border-zinc-700",
        text: "text-zinc-700",
        ring: "ring-zinc-700",
        gradientFrom: "from-zinc-700",
        gradientTo: "to-zinc-700",
        hoverBorder: "group-hover:border-zinc-700",
        decoration: "decoration-zinc-700/50",
        shadow: "shadow-zinc-700/20"
    }
};

export const getTypeTheme = (type: string) => {
    return typeColors[type.toLowerCase()] || typeColors.normal;
};
