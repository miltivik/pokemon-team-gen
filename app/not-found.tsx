import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black px-4">
            <div className="text-center space-y-6">
                <h1 className="text-9xl font-bold text-zinc-200 dark:text-zinc-800">404</h1>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold dark:text-white">Página no encontrada</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                        Lo sentimos, la página que buscas no existe. Puede que haya sido movida o eliminada.
                    </p>
                </div>
                <div className="flex gap-4 justify-center">
                    <Link href="/">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            Volver al generador
                        </Button>
                    </Link>
                    <Link href="https://pokemonshowdown.com" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                            Ir a Pokemon Showdown
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
