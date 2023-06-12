import { ActionType, } from './enums';

export type BetModel = {
    id: number;
    dateCreated: Date;
    betStatus: number; //0,1
    winStatus: number; //0,1,2,3,4,5
    stake?: number;
    counteragentId?: number;
    counteragent?: string;
    sport?:	string;
    liveStatus:	number; //0,1,2,3
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
    profits?: number;
    notes?: string;
    
    //user??

    actionTypeApplied?: ActionType;
    isSavedInDatabase: boolean;
};