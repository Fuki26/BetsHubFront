import { ActionType, } from './enums';

export type BetModel = {
    id: number;
    dateCreated: Date;
    betStatus: number;
    stake?: number;
    counteragentId?: number;
    counteragent?: string;
    sport?:	string;
    liveStatus:	number;
    psLimit?: number;
    market?: string;
    tournament?: string;
    selection?: string;
    amountBGN?: number;
    amountEUR?: number;
    amountUSD?: number;
    amountGBP?: number;
    totalAmount?: number;
    odd?: number;
    dateFinished?: Date;
    dateStaked?: Date;
    profits?: number;
    notes?: string;
    
    //user??

    actionTypeApplied?: ActionType;
    isSavedInDatabase: boolean;
}