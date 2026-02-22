
export type MoveSource = 'level' | 'tm' | 'egg' | 'tutor' | 'other';

export type LabeledMove = {
    name: string;
    source: MoveSource;
};

export async function getRandomCompetitiveMoves(pokemonName: string): Promise<LabeledMove[]> {
    // Placeholder for future integration with Showdown/PokeAPI learnsets
    return [
        { name: 'protect', source: 'tm' },
        { name: 'substitute', source: 'tm' },
        { name: 'rest', source: 'tm' },
        { name: 'toxic', source: 'tm' },
    ];
}
