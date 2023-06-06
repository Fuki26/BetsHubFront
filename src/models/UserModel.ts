import { Role, } from '../database-models';
import { ActionType, } from './enums';

export type UserModel = {
    id?: string;
    userName?: string;
    password: string;
    roleId: number;
    role: Role;
    address: string;
    device: string;

    actionTypeApplied?: ActionType;
    isSavedInDatabase: boolean;
};