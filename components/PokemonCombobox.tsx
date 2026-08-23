"use client";

import * as React from "react";
import { Check, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAllPokemonNames, getPokemonSummary } from "@/lib/pokemon-summary";
import { getPokemonSpriteUrl } from "@/lib/pokemon-sprites";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface PokemonComboboxProps {
    id?: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const POKEMON_SEARCH_INDEX = getAllPokemonNames().map((name) => ({
    name,
    normalizedName: name.toLowerCase(),
}));

function getPokemonSearchResults(query: string, limit = 50) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    let exactMatch: string | undefined;
    const prefixMatches: string[] = [];
    const containsMatches: string[] = [];

    for (const pokemon of POKEMON_SEARCH_INDEX) {
        if (pokemon.normalizedName === normalizedQuery) {
            exactMatch = pokemon.name;
            continue;
        }

        if (pokemon.normalizedName.startsWith(normalizedQuery)) {
            if (prefixMatches.length < limit) {
                prefixMatches.push(pokemon.name);
            }
            continue;
        }

        if (
            pokemon.normalizedName.includes(normalizedQuery) &&
            prefixMatches.length + containsMatches.length < limit
        ) {
            containsMatches.push(pokemon.name);
        }
    }

    return [
        ...(exactMatch ? [exactMatch] : []),
        ...prefixMatches,
        ...containsMatches,
    ].slice(0, limit);
}

export function PokemonCombobox({ id, value, onChange, placeholder, className }: PokemonComboboxProps) {
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState(value || "");
    const deferredQuery = React.useDeferredValue(query);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Sync query with value when value changes externally
    React.useEffect(() => {
        setQuery(value || "");
    }, [value]);

    // Filter pokemon based on query
    const filteredPokemon = React.useMemo(() => {
        return getPokemonSearchResults(deferredQuery);
    }, [deferredQuery]);

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
                    id={id}
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
                                const data = getPokemonSummary(name);
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
                                                    src={getPokemonSpriteUrl({ ...data, name }, "sprite")}
                                                    alt={name}
                                                    width={32}
                                                    height={32}
                                                    sizes="32px"
                                                    className="object-contain p-0.5"
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
