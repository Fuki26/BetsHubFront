import { Currency } from ".";

export type ChildBet = {
    id: number;
    parentId: number;
    parentBet: string;
    currencyId: number;
    currency: Currency;
    amount: number;
    odd: number;
}