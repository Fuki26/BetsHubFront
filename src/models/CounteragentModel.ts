import { ActionType, } from './enums';

export type CounteragentModel = {
    id: number;
    name: string;
    counteragentCategoryId: string; 
    counteragentCategory: string; 
    // usedMinRate: number; 
    // usedMaxRate: number; 
    maxRate: number;
    dateCreated: Date;
    dateChanged: Date;
    userId: string;
    user: string;

    actionTypeApplied?: ActionType;
    isSavedInDatabase: boolean;
};