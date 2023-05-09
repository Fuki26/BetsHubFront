import { CounterAgent } from ".";

export type Expense = {
    id: number;
    counteragentId: number | null;
    counteragent: CounterAgent | null;
    description: string;
    dateFrom: Date;
    dateTo: Date;
    dateCreated: Date;
    amount: number;
}