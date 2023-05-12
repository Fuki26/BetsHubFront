import { Currency, Market, Sport, Tournament, Selection, } from ".";
import { ChildBet } from "./ChildBet";
import { CounterAgent } from "./CounterAgent"

export type Bet = {
    id: number;
    dateCreated: string;
    counteragent: CounterAgent | null;
    sport: Sport | null;
    liveStatus: number;
    psLimit: number;
    market: Market | null;
    stakeValue: number | null;
    tournament: Tournament | null;
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