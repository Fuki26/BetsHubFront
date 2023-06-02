import { ActionType } from "./enums";

export type CurrencyModel = {
    id: number | null;
    name: string;
    abbreviation: string;
    conversionRateToBGN: number;
    dateCreated: Date;
    dateChanged: Date;

    actionTypeApplied?: ActionType;
    isSavedInDatabase: boolean;
};