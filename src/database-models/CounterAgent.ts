import { CounterAgentCategory, User, } from '.';

export type Counteragent = {
    id: number;
    name: string;
    counteragentCategoryId: number;
    counteragentCategory: CounterAgentCategory;     
    maxRate: number;
    dateCreated: string;
    dateChanged: string;
    deleted: boolean;
};