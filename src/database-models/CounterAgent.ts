import { User } from ".";
import { CounteragentCategory } from "./CounteragentCategory";

export type Counteragent = {
    id: number;
    name: string;
    counteragentCategoryId: number;
    counteragentCategory: CounteragentCategory;     
    usedMinRate: number;
    usedMaxRate: number;
    maxRate: number;
    dateCreated: Date;
    dateChanged: Date;
    userId: string;
    user: User;
}