export interface PlaystyleDef {
    id: string;
    icon: string;
    title: string;
    descKey: string;
    templateId?: string;
    colorTheme: "red" | "cyan" | "green" | "blue" | "yellow" | "purple";
}

export interface TipDef {
    titleKey: string;
    descKey: string;
}

export interface FormatGuideDef {
    formatId: string;
    playstyles: PlaystyleDef[];
    tips?: TipDef[];
}

export const FORMAT_GUIDES: Record<string, FormatGuideDef> = {
    vgc: {
        formatId: "vgc",
        playstyles: [
            {
                id: "damage-spam",
                icon: "🔥",
                title: "Damage Spam",
                descKey: "guides.damageSpamDesc",
                templateId: "offense",
                colorTheme: "red"
            },
            {
                id: "tailwind",
                icon: "💨",
                title: "Tailwind",
                descKey: "guides.tailwindDesc",
                templateId: "tailwind",
                colorTheme: "cyan"
            },
            {
                id: "trick-room",
                icon: "🦾",
                title: "Trick Room",
                descKey: "guides.trickRoomDesc",
                templateId: "trickroom",
                colorTheme: "green"
            }
        ],
        tips: [
            { titleKey: "guides.vgcTip1Title", descKey: "guides.vgcTip1Desc" },
            { titleKey: "guides.vgcTip2Title", descKey: "guides.vgcTip2Desc" },
            { titleKey: "guides.vgcTip3Title", descKey: "guides.vgcTip3Desc" },
            { titleKey: "guides.vgcTip4Title", descKey: "guides.vgcTip4Desc" }
        ]
    },
    default: {
        formatId: "default",
        playstyles: [
            {
                id: "balanced",
                icon: "🛡️",
                title: "Balanced",
                descKey: "guides.bulkyOffenseDesc",
                colorTheme: "blue"
            },
            {
                id: "hyper-offense",
                icon: "⚡",
                title: "Hyper Offense",
                descKey: "guides.hyperOffenseDesc",
                colorTheme: "red"
            }
        ]
    }
};

export const COLOR_THEMES: Record<string, { bg: string, text: string, border?: string, gradient?: string }> = {
    red: {
        bg: "bg-red-50 dark:bg-red-900/20",
        text: "text-red-800 dark:text-red-300",
        border: "border-red-100 dark:border-red-900/30",
        gradient: "from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10"
    },
    cyan: {
        bg: "bg-cyan-50 dark:bg-cyan-900/20",
        text: "text-cyan-800 dark:text-cyan-300",
        border: "border-cyan-100 dark:border-cyan-900/30",
        gradient: "from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/10"
    },
    green: {
        bg: "bg-green-50 dark:bg-green-900/20",
        text: "text-green-800 dark:text-green-300",
        border: "border-green-100 dark:border-green-900/30",
        gradient: "from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10"
    },
    blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-800 dark:text-blue-300",
        border: "border-blue-100 dark:border-blue-900/30",
        gradient: "from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10"
    },
    yellow: {
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        text: "text-yellow-800 dark:text-yellow-300",
        border: "border-yellow-100 dark:border-yellow-900/30",
        gradient: "from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10"
    },
    purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        text: "text-purple-800 dark:text-purple-300",
        border: "border-purple-100 dark:border-purple-900/30",
        gradient: "from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10"
    }
};
