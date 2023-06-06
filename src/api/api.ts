import axios from 'axios';
import { Bet, Counteragent, CounteragentCategory, Currency, Expense, Statistics, User, } from '../database-models';
import { BetModel, CounteragentModel, CurrencyModel, ExpenseModel, ISelectionsResult, } from '../models';
import { StatisticType } from '../models/enums';

const domain = 'http://213.91.236.205:5000';

const getPendingBets = async (): Promise<Array<Bet> | undefined> => {
    try {
        const getBetsResult = 
            await axios.get(`${domain}/GetAllBets?StartIndex=0&Count=5000&BetStatus=0`);
        return getBetsResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

const getCompletedBets = async (): Promise<Array<Bet> | undefined> => {
    try {
        const getBetsResult = await axios.get(`${domain}/GetAllBets?StartIndex=0&Count=5000&BetStatus=1`);
        return getBetsResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

const getBetStatistics = async (props: { 
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

const getExpenses = async (): Promise<Array<Expense> | undefined> => {
    try {
        const getExpensesResult = await axios.get(`${domain}/GetAllExpenses`);
        return getExpensesResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

const getCounteragents = async (): Promise<Array<Counteragent> | undefined> => {
    try {
        const getCountaagentsResult = await axios.get(`${domain}/GetAllCounteragents`);
        return getCountaagentsResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

const getCounteragentsCategories = async (): Promise<Array<CounteragentCategory> | undefined> => {
    try {
        const getCounteragentsCategoriesResult = await axios.get(`${domain}/GetAllCounteragentsCategories`);
        return getCounteragentsCategoriesResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

const getUsers = async (): Promise<Array<User> | undefined> => {
    try {
        const getUsersResult = await axios.get(`${domain}/GetAllUsers`);
        return getUsersResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

const getCurrencies = async (): Promise<Array<Currency> | undefined> => {
    try {
        const getCurrenciesResult = await axios.get(`${domain}/GetAllCurrencies`);
        return getCurrenciesResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

const getSports = async (): Promise<Array<string> | undefined> => {
    try {
        const getCountaagentsResult = await axios.get(`${domain}/GetAllSports`);
        return getCountaagentsResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

const getTournaments = async (): Promise<Array<string> | undefined> => {
    try {
        const getCountaagentsResult = await axios.get(`${domain}/GetAllTournaments`);
        return getCountaagentsResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

const getMarkets = async (): Promise<Array<string> | undefined> => {
    try {
        const getCountaagentsResult = await axios.get(`${domain}/GetAllMarkets`);
        return getCountaagentsResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

const getSelections = async (): Promise<ISelectionsResult | undefined> => {
    try {
        const getCountaagentsResult = await axios.get(`${domain}/GetAllSelections`);
        return getCountaagentsResult.data;
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

const deleteBet = async (props: { id: number; }) => {
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

const deleteExpense = async (props: { id: number; }) => {
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

const deleteCounteragent = async (props: { id: number; }) => {
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

const upsertBet = async (bet: BetModel) => {
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
        const id = bet.isSavedInDatabase
            ? `Id=${obj.Id}&`
            : '';
        await axios.post(`${domain}/UpsertBets?${id}BetStatus=${obj.BetStatus}&Stake=${obj.Stake}&CounteragentId=${obj.CounteragentId}&Sport=${obj.Sport}&LiveStatus=${obj.LiveStatus}&PSLimit=${obj.PSLimit}&Market=${obj.Market}&Tournament=${obj.Tournament}&Selection=${obj.Selection}&AmountBGN=${obj.AmountBGN}&AmountEUR=${obj.AmountEUR}&AmountUSD=${obj.AmountUSD}&AmountGBP=${obj.AmountGBP}&Odd=${obj.Odd}&Profits=${obj.Profits}&Notes=${obj.Notes}`);
    } catch(e) {
        alert(JSON.stringify(e));
    }
}

const upsertExpense = async (expense: ExpenseModel) => {
    try {
        console.log(`UPSERT EXPENSE - ${JSON.stringify(expense)}`);
        const id = expense.isSavedInDatabase
            ? `Id=${expense.id}&`
            : '';
        await axios.post(`${domain}/UpsertExpense?${id}CounteragentId=${expense.counteragentId}&Description=${expense.description}&Amount=${expense.amount}`);
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

const upsertCounteragent = async (counteragent: CounteragentModel) => {
    try {
        console.log(`UPSERT COUNTERAGENT - ${JSON.stringify(counteragent)}`);
        const id = counteragent.isSavedInDatabase
            ? `Id=${counteragent.id}&`
            : 'Id=NULL&';
        await axios.post(`${domain}/UpsertCounteragent?${id}Name=${counteragent.name}&CounteragentCategoryId=${counteragent.counteragentCategoryId}&MaxRate=${counteragent.maxRate}&UserId=${counteragent.userId}`);
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

const upsertCurrency = async (currency: CurrencyModel) => {
    try {
        console.log(`UPSERT CURRENCY - ${JSON.stringify(currency)}`);
        const id = currency.isSavedInDatabase
            ? `Id=${currency.id}&`
            : '';
        await axios.post(`${domain}/UpsertCurrency?${id}Name=${currency.name}&Abbreviation=${currency.abbreviation}&ConversionRateToBGN=${currency.conversionRateToBGN}`);
    } catch(e) {
        alert(JSON.stringify(e));
    }
};

export {
    getPendingBets,
    getCompletedBets,
    getBetStatistics,
    getExpenses,
    getCounteragents,
    getCounteragentsCategories,
    getUsers,
    getCurrencies,
    getSports,
    getTournaments,
    getMarkets,
    getSelections,
    deleteBet,
    deleteExpense,
    deleteCounteragent,
    upsertBet,
    upsertExpense,
    upsertCounteragent,
    upsertCurrency,
};