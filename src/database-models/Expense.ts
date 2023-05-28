import { Counteragent, } from '.';

export type Expense = {
    id: number;
    counteragentId?: number;
    counteragent?: Counteragent;
    description: string;
    dateFrom: string;
    dateTo: string;
    dateCreated: string;
    amount: number;
};