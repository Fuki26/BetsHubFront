import { Counteragent } from ".";

export type Expense = {
    id: number;
    counteragentId?: number;
    counteragent?: Counteragent;
    description: string;
    dateFrom: Date;
    dateTo: Date;
    dateCreated: Date;
    amount: number;
}