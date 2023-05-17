export type StatisticItemModel = {
    id: number,
    periodType: 'CalendarBased' | '3mTillToday' | '6mTillToday',
    period: string;
    pl: string;
    winRate: string;
    yield: string;
    turnover: string;
    profit: string;
}