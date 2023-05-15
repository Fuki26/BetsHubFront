import { Currency, Market, Sport, Tournament, Selection, } from ".";
import { ChildBet } from "./ChildBet";
import { Counteragent } from "./Counteragent"

export type Bet = {
    id: number;
    dateCreated: string;
    counteragent?: Counteragent;
    sport?: Sport;
    liveStatus: number;
    psLimit: number;
    market?: Market;
    stakeValue?: number;
    tournament?: Tournament;
    selection?: Selection;
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