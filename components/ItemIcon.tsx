"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getItemSpriteUrls } from "@/lib/items";

interface ItemIconProps {
    item: string;
    className?: string;
    size?: number;
}

/**
 * SVG fallback icon for items when no sprite is available.
 * This is a simple bag/backpack icon to represent items.
 */
function ItemFallbackIcon({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-600 dark:text-amber-400"
        >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    );
}

export function ItemIcon({ item, className = "", size = 24 }: ItemIconProps) {
    const urls = useMemo(() => getItemSpriteUrls(item), [item]);
    const [srcIndex, setSrcIndex] = useState(0);
    const [allFailed, setAllFailed] = useState(false);
    const [prevItem, setPrevItem] = useState(item);

    if (item !== prevItem) {
        setPrevItem(item);
        setSrcIndex(0);
        setAllFailed(false);
    }

    const handleError = useCallback(() => {
        if (srcIndex < urls.length - 1) {
            setSrcIndex((prev) => prev + 1);
        } else {
            setAllFailed(true);
        }
    }, [srcIndex, urls.length]);

    // No item
    if (!item || item.toLowerCase() === 'nothing' || item.toLowerCase() === 'no item') {
        return null;
    }

    // All sources exhausted - show fallback icon
    if (allFailed || srcIndex >= urls.length) {
        return (
            <div
                className={`inline-flex items-center justify-center align-middle select-none ${className}`}
                style={{ width: size, height: size }}
                title={item}
            >
                <ItemFallbackIcon size={Math.max(size * 0.7, 12)} />
            </div>
        );
    }

    return (
        <div className={`relative inline-block align-middle select-none ${className}`} style={{ width: size, height: size }}>
            <Image
                src={urls[srcIndex]}
                alt={item}
                fill
                className="object-contain drop-shadow-sm"
                onError={handleError}
                unoptimized
                draggable={false}
            />
        </div>
    );
}
