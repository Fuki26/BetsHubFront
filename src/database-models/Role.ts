import { User } from ".";

export type Role = {
    id: number;
    normalizedName?: string;
    concurrencyStamp?: string;
    name?: string;
    roleType: number;
    users: Array<User>;
}