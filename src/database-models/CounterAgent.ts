import { User } from ".";
import { CounterAgentCategory } from "./CounterAgentCategory";

export type CounterAgent = {
    id: number;
    name: string;
    counteragentCategoryId: number;
    counteragentCategory: CounterAgentCategory;     
    usedMinRate: number;
    usedMaxRate: number;
    maxRate: number;
    dateCreated: Date;
    dateChanged: Date;
    userId: string;
    user: User;
}