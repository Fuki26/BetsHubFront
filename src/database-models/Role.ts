export type Role = {
    id: number;
    normalizedName: string;
    concurrencyStamp: string;
    name: string;
    roleType: number;
    users: Array<string>;
}