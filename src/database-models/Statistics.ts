import { StatisticType, } from '../models';

export type Statistics = {
    type: StatisticType;
    current: StatisticsPeriod;
    threeMonths: StatisticsPeriod;
    sixMonths: StatisticsPeriod;
};

export type StatisticsPeriod = {
    winRate: number;
    yield: number;
    turnOver: number;
    profit: number;
};