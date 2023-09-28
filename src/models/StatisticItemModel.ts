export type StatisticItemModel = {
    id: number,
    periodType: 'all time' | 'last 3m' | 'last 6m',
    winRate: string;
    yield: string;
    turnOver: number;
    profit: number;
};