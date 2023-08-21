export type StatisticItemModel = {
    id: number,
    periodType: 'today' | 'last 3m' | 'last 6m',
    winRate: number;
    yield: number;
    turnOver: number;
    profit: number;
};