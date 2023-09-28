import { IDropdownValue, } from '.';
import { ActionType, } from './enums';

export type CounteragentModel = {
    id: number | null;
    name: string;
    counteragentCategory?: IDropdownValue;
    user?: IDropdownValue;
    maxRate: number;
    dateCreated: Date;
    dateChanged: Date;

    actionTypeApplied?: ActionType;
    isSavedInDatabase: boolean;
};