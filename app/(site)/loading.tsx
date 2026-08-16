
export default function Loading() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <div className="container mx-auto flex flex-col gap-8 px-4 py-8">
                <div className="mx-auto h-[250px] w-full max-w-[970px] animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 text-center">
                    <div className="h-10 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-5 w-80 max-w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }, (_, index) => (
                        <div
                            key={index}
                            aria-hidden="true"
                            className="h-48 animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
