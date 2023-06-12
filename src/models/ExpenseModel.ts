import { ActionType, } from './enums';

export type ExpenseModel = {
    id: number;
    counteragentId?: number;
    counteragent?: string;
    amount: number;
    description: string;
    dateCreated: Date;

    actionTypeApplied?: ActionType;
    isSavedInDatabase: boolean;
};