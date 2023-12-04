import { WinStatus, } from '../models';
import { Counteragent, } from './CounterAgent';

export type CurrencyAmount = {
  abbreviation: string;
  amount: number;
};

export type Bet = {
    id: number;
    dateCreated: string;
    betStatus: number;
    winStatus: number;
    stake?  : number;
    counteragentId?: number;
    counteragent?: Counteragent;
    sport?:	string;
    liveStatus:	number;
    psLimit?: number;
    market?: string;
    tournament?: string;
    selection?: string;
    currencyAmounts?: CurrencyAmount[]; 
    odd?: number;
    dateFinished?: string;
    profits?: number;
    notes?: string;
    color?: string;
    yield?: number;
    totalAmount?: number;

    //user??
};
