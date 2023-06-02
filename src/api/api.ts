import axios from 'axios';
import { Bet, Counteragent, CounteragentCategory, Currency, Expense, Statistics, User, } from '../database-models';
import { BetModel, CounteragentModel, CurrencyModel, ExpenseModel, ISelectionsResult, } from '../models';
import { StatisticType } from '../models/enums';

const domain = 'http://213.91.236.205:5000';

export const getPendingBets = async (): Promise<Array<Bet> | undefined> => {
    try {
        const getBetsResult = 
            await axios.get(`${domain}/GetAllBets?StartIndex=0&Count=200&BetStatus=0`);
        return getBetsResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

export const getCompletedBets = async (): Promise<Array<Bet> | undefined> => {
    try {
        const getBetsResult = await axios.get(`${domain}/GetAllBets?StartIndex=0&Count=200&BetStatus=1`);
        return getBetsResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

export const getBetStatistics = async (props: { 
    id: number; 
    type: StatisticType; 
}): Promise<Statistics | undefined> => {
    try {
        const { id, type, } = props;
        const getBetsResult = 
            await axios.get(`${domain}/GetStatistics?BetId=${id}&StatisticsType=${type}`);
        return { 
            ...getBetsResult.data,
            type,
        };
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

export const getExpenses = async (): Promise<Array<Expense> | undefined> => {
    try {
        const getExpensesResult = await axios.get(`${domain}/GetAllExpenses`);
        return getExpensesResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

export const getCounteragents = async (): Promise<Array<Counteragent> | undefined> => {
    try {
        const getCountaagentsResult = await axios.get(`${domain}/GetAllCounteragents`);
        return getCountaagentsResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

export const getCounteragentsCategories = async (): Promise<Array<CounteragentCategory> | undefined> => {
    try {
        const getCounteragentsCategoriesResult = await axios.get(`${domain}/GetAllCounteragentsCategories`);
        return getCounteragentsCategoriesResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

export const getUsers = async (): Promise<Array<User> | undefined> => {
    try {
        const getUsersResult = await axios.get(`${domain}/GetAllUsers`);
        return getUsersResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

export const getCurrencies = async (): Promise<Array<Currency> | undefined> => {
    try {
        const getCurrenciesResult = await axios.get(`${domain}/GetAllCurrencies`);
        return getCurrenciesResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

export const getSports = async (): Promise<Array<string> | undefined> => {
    try {
        const getCountaagentsResult = await axios.get(`${domain}/GetAllSports`);
        return getCountaagentsResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

export const getTournaments = async (): Promise<Array<string> | undefined> => {
    try {
        const getCountaagentsResult = await axios.get(`${domain}/GetAllTournaments`);
        return getCountaagentsResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

export const getMarkets = async (): Promise<Array<string> | undefined> => {
    try {
        const getCountaagentsResult = await axios.get(`${domain}/GetAllMarkets`);
        return getCountaagentsResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

export const getSelections = async (): Promise<ISelectionsResult | undefined> => {
    try {
        const getCountaagentsResult = await axios.get(`${domain}/GetAllSelections`);
        return getCountaagentsResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

export const deleteBet = async (props: { id: number; }) => {
    try {
        const { id, } = props;
        const deleteBetResult = await axios.delete(`${domain}/DeleteBet`, {
            data: id,
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
            }
        });

        return deleteBetResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

export const deleteExpense = async (props: { id: number; }) => {
    try {
        const { id, } = props;
        const deleteExpenseResult = await axios.delete(`${domain}/DeleteExpense`, {
            data: id,
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
            }
        });

        return deleteExpenseResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

export const deleteCounteragent = async (props: { id: number; }) => {
    try {
        const { id, } = props;
        const deleteCounteragentResult = await axios.delete(`${domain}/DeleteCounteragent`, {
            data: id,
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
            }
        });

        return deleteCounteragentResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

export const upsertBet = async (bet: BetModel) => {
    try {
        const obj = {
            Id: bet.isSavedInDatabase
                ? bet.id
                : null,
            BetStatus: bet.betStatus,
            Stake: bet.stake ? bet.stake : 0,
            CounteragentId: bet.counteragentId,
            Sport: bet.sport ? bet.sport : '',
            LiveStatus: bet.liveStatus,
            PSLimit: bet.psLimit ? bet.psLimit : 0,
            Market: bet.market ? bet.market : '',
            Tournament: bet.tournament ? bet.tournament : '',
            Selection: bet.selection ? bet.selection : '',
            AmountBGN: bet.amountBGN ? bet.amountBGN : 0,
            AmountEUR: bet.amountEUR ? bet.amountEUR : 0,
            AmountUSD: bet.amountUSD ? bet.amountUSD : 0,
            AmountGBP: bet.amountGBP ? bet.amountGBP : 0,
            Odd: bet.odd ? bet.odd : 0,
            DateFinished: bet.dateFinished ? bet.dateFinished.toString() : null,
            DateStaked: bet.dateStaked ? bet.dateStaked.toString() : null,
            Profits: bet.profits ? bet.profits : 0,
            Notes: bet.notes ? bet.notes : '',
        };
        console.log(`UPSERT BET - ${JSON.stringify(obj)}`);
        await axios.post(`${domain}/UpsertBets`, obj);
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

export const upsertExpense = async (expense: ExpenseModel) => {
    try {
        console.log(`UPSERT EXPENSE - ${JSON.stringify(expense)}`);
        await axios.post(`${domain}/UpsertExpense?Id=${expense.id}&CounteragentId=${expense.counteragentId}&Description=${expense.description}&Amount=${expense.amount}`);
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

export const upsertCounteragent = async (counteragent: CounteragentModel) => {
    try {
        console.log(`UPSERT COUNTERAGENT - ${JSON.stringify(counteragent)}`);
        await axios.post(`${domain}/UpsertCounteragent?Id=${counteragent.id}&Name=${counteragent.name}&CounteragentCategoryId=${counteragent.counteragentCategoryId}&MaxRate=${counteragent.maxRate}&UserId=${counteragent.userId}`);
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

export const upsertCurrency = async (currency: CurrencyModel) => {
    try {
        console.log(`UPSERT CURRENCY - ${JSON.stringify(currency)}`);
        await axios.post(`${domain}/UpsertCurrency?Id=${currency.id}&Name=${currency.name}&Abbreviation=${currency.abbreviation}&ConversionRateToBGN=${currency.conversionRateToBGN}`);
    } catch(e) {
        alert(JSON.stringify(e));
    }
};