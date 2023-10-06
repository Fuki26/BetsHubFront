import { StatisticType, } from '../models';

export type Statistics = {
    type: StatisticType;
    allTime: StatisticsPeriod;
    threeMonths: StatisticsPeriod;
    sixMonths: StatisticsPeriod;
};

export type StatisticsPeriod = {
    winRate: number;
    yield: number;
    turnOver: number;
    profit: number;
};