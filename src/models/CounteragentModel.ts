import { ActionType, } from './enums';

export type CounteragentModel = {
    id: number;
    name: string;
    counteragentCategory: string; 
    usedMinRate: number; 
    usedMaxRate: number; 
    maxRate: number;
    dateCreated: Date;
    dateChanged: Date;
    user: string;

    actionTypeApplied?: ActionType;
    isSavedInDatabase: boolean;
};