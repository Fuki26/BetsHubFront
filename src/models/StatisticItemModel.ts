export type StatisticItemModel = {
    id: number,
    periodType: 'CalendarBased' | '3mTillToday' | '6mTillToday',
    winRate: number;
    yield: number;
    turnOver: number;
    profit: number;
};