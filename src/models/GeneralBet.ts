import { ChildBet, CounterAgent, Currency, Market, Tournament } from "../database-models";

export type GeneralBet = {
    id: number;
    dateCreated: Date;
    counteragent: CounterAgent | null;
    sport: number;
    liveStatus: number;
    psLimit: number;
    marketId: number | null;
    market: Market | null;
    stakeValue: number;
    tournamentId: number | null;
    tournament: Tournament | null;
    selectionId: number | null;
    selection: Selection | null;
    currencyId: number;
    currency: Currency;
    amount: number;
    odd: number;
    dateFinished: Date;
    dateStaked: Date;
    profits: number;
    notes: string;
    totalAmount: number;
    childBets: Array<ChildBet>;

    savedInDatabase: boolean;
    isCanceled: boolean;
    parentId: number | null;
    clickedForChildren: boolean;
}