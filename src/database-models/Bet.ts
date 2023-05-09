import { Currency, Market, Tournament } from ".";
import { ChildBet } from "./ChildBet";
import { CounterAgent } from "./CounterAgent"

export type Bet = {
    id: number;
    dateCreated: string;
    counteragentId: number | null;
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
    dateFinished: string;
    dateStaked: string;
    profits: number;
    notes: string;
    totalAmount: number;
    childBets: Array<ChildBet>;
}