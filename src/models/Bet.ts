
export type Bet = {
    id: number;
    dateCreated: Date;
    counteragentId: number;
    counteragent: any;
    sport: number;
    liveStatus: number;
    psLimit: number;
    marketId: number;
    market: null;
    stakeValue: number;
    tournamentId: number;
    tournament: any;
    selectionId: number;
    selection: any;
    amount: number;
    odd: number;
    dateFinished: Date;
    dateStaked: Date;
    profits: number;
    notes: string;
}