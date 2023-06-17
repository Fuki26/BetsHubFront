import { IDropdownValue } from '.';
import { ActionType, } from './enums';

export type ExpenseModel = {
    id: number;
    counterAgent?: IDropdownValue;
    counterAgentCategory?: IDropdownValue;
    amount: number;
    description: string;
    dateCreated: Date;

    actionTypeApplied?: ActionType;
    isSavedInDatabase: boolean;
};