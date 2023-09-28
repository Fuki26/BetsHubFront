import { IDropdownValue, } from '.';
import { ActionType, } from './enums';

export type BetModel = {
    id: number;
    dateCreated: Date;
    betStatus?: IDropdownValue;
    winStatus?: IDropdownValue;
    liveStatus?: IDropdownValue;
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

    actionTypeApplied?: ActionType;
    isSavedInDatabase: boolean;
};