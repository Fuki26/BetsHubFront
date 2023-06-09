import { WinStatus } from '../models/enums';
import { Counteragent } from './CounterAgent';

export type CurrencyAmount = {
  abbreviation: string;
  amount: number;
};

export type Bet = {
    id: number;
    dateCreated: string;
    betStatus: number; //0,1
    winStatus: number; //0,1,2,3,4,5
    stake?  : number;
    counteragentId?: number;
    counteragent?: Counteragent;
    sport?:	string;
    liveStatus:	number; //0,1,2,3
    psLimit?: number;
    market?: string;
    tournament?: string;
    selection?: string;
    currencyAmounts?: CurrencyAmount[]; 
    odd?: number;
    dateFinished?: string;
    profits?: number;
    notes?: string;
    totalAmount?: number;

    //user??
};
