import { IDropdownValue } from '.';
import { ActionType, } from './enums';

export type BetModel = {
    id: number;
    dateCreated: Date;
    betStatus?: IDropdownValue; //0,1
    winStatus?: IDropdownValue; //0,1,2,3,4,5
    liveStatus?: IDropdownValue; //0,1,2,3
    stake?: number;
    counterAgent?: IDropdownValue;
    counterAgentCategory?: IDropdownValue;
    sport?:	IDropdownValue;
    psLimit?: number;
    market?: IDropdownValue;
    tournament?: IDropdownValue;
    selection?: IDropdownValue;
    amounts?: Record<string, number>; 
    totalAmount?: number;
    odd?: number;
    dateFinished?: Date;
    profits?: number;
    notes?: string;
    
    //user??

    actionTypeApplied?: ActionType;
    isSavedInDatabase: boolean;
};