import { ChildBet, Counteragent, Currency, Market, Tournament } from "../database-models";

export type GeneralBet = {
    id: number;
    dateCreated: Date;
    counteragent: string;
    sport: string;
    market: string;
    stake: number;
    liveStatus: string;
    psLimit: number;
    tournament: string;
    selection: string;
    bgn: number;
    usd: number;
    eur: number;
    bgp: number;
    amount: number;
    odd: number;
    dateFinished: Date;
    dateStakedAndUserCreated: Date;
    expenseApplied: number;
    brutPLN: number;
    netPLN: number;
    volume: number;
    notes: string;


    savedInDatabase: boolean;
    isCanceled: boolean;
    parentId: number | null;
    clickedForChildren: boolean;
}