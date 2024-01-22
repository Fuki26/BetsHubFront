export type BetsHistoryItemModel = {
    id: number;
    betId: number;
    field?: string;
    oldValue?: string;
    newValue?: string;
    operation?: 'Insert' | 'Update';
    userName?: string;
    operationDate?: string;
};