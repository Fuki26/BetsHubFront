import { ActionType, } from './enums';

export type CounteragentModel = {
    id: number | null;
    name: string;
    counteragentCategoryId: number; 
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