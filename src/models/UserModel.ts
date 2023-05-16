import { ActionType } from "./enums";

export type UserModel = {
    id?: string;
    userName?: string;
    password: string;
    role: number;
    address: string;
    device: string;

    actionTypeApplied?: ActionType;
    isSavedInDatabase: boolean;
}