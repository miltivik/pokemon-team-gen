"use client";

import * as React from "react";
import { Check, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    getPokemonData,
    getAllPokemonNames,
    getPokemonSpriteUrl,
} from "@/lib/showdown-data";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface PokemonComboboxProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function PokemonCombobox({ value, onChange, placeholder, className }: PokemonComboboxProps) {
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState(value || "");
    const [allPokemon, setAllPokemon] = React.useState<string[]>([]);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Load pokemon names on mount
    React.useEffect(() => {
        setAllPokemon(getAllPokemonNames());
    }, []);

    // Sync query with value when value changes externally
    React.useEffect(() => {
        setQuery(value || "");
    }, [value]);

    // Filter pokemon based on query
    const filteredPokemon = React.useMemo(() => {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        
        // If query matches a pokemon exactly, show it first
        // Otherwise show matches
        return allPokemon
            .filter(name => name.toLowerCase().includes(lowerQuery))
            .sort((a, b) => {
                const aLower = a.toLowerCase();
                const bLower = b.toLowerCase();
                // Exact match first
                if (aLower === lowerQuery) return -1;
                if (bLower === lowerQuery) return 1;
                // Starts with query second
                if (aLower.startsWith(lowerQuery) && !bLower.startsWith(lowerQuery)) return -1;
                if (!aLower.startsWith(lowerQuery) && bLower.startsWith(lowerQuery)) return 1;
                return 0;
            })
            .slice(0, 50); // Limit results
    }, [query, allPokemon]);

    // Handle click outside to close
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (name: string) => {
        onChange(name);
        setQuery(name);
        setOpen(false);
    };

    const handleClear = () => {
        onChange("");
        setQuery("");
        setOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <div className="relative">
                <div className="pointer-events-none absolute flex items-center pl-2.5" style={{ top: 0, bottom: 0, left: 0 }}>
                    <Search className="text-muted-foreground" size={14} />
                </div>
                <Input
                    ref={inputRef}
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!open) setOpen(true);
                        if (e.target.value === "") {
                            onChange("");
                        }
                    }}
                    onFocus={() => {
                        setOpen(true);
                    }}
                    className="pl-8 pr-8"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute flex items-center pr-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        style={{ top: 0, bottom: 0, right: 0 }}
                        type="button"
                    >
                        <X size={14} />
                        <span className="sr-only">Clear</span>
                    </button>
                )}
            </div>

            {open && query && (
                <div className="absolute z-50 mt-1 max-h-[300px] w-full overflow-auto rounded-md border bg-white dark:bg-zinc-900 py-1 text-zinc-950 dark:text-zinc-50 shadow-md ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95">
                    {filteredPokemon.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            {t("form.noPokemonFound")}
                        </div>
                    ) : (
                        <div className="p-1">
                            {filteredPokemon.map((name) => {
                                const data = getPokemonData(name);
                                const isSelected = value === name;
                                
                                return (
                                    <div
                                        key={name}
                                        onClick={() => handleSelect(name)}
                                        className={cn(
                                            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                                            "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                            isSelected && "bg-zinc-100 dark:bg-zinc-800 font-medium"
                                        )}
                                    >
                                        <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800">
                                            {data ? (
                                                <Image 
                                                    src={getPokemonSpriteUrl({ ...data, name })} 
                                                    alt={name}
                                                    width={32}
                                                    height={32}
                                                    className="object-contain p-0.5"
                                                    unoptimized
                                                />
                                            ) : (
                                                <span className="text-[10px] text-zinc-400">?</span>
                                            )}
                                        </div>
                                        <span className="flex-1 truncate">{name}</span>
                                        {isSelected && (
                                            <Check className="ml-auto h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
