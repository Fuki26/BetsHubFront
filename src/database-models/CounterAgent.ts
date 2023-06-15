import { User, } from '.';
import { CounteragentCategory, } from './CounterAgentCategory';

export type Counteragent = {
    id: number;
    name: string;
    counteragentCategoryId: number;
    counteragentCategory: CounteragentCategory;     
    maxRate: number;
    dateCreated: string;
    dateChanged: string;
    userId: string;
    user: User;
    deleted: boolean;
};