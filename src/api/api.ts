import axios from 'axios';
import { Bet, Counteragent, Currency, Expense, Statistics, User, } from '../database-models';
import { BetModel, CounteragentModel, CurrencyModel, ExpenseModel, ISelectionsResult, } from '../models';
import { StatisticType } from '../models';
import { notifyError } from '../services';
const { evaluate } = require('mathjs')

const domain = 'http://213.91.236.205:5000';
//const domain = 'http://localhost:5001'

export type BetsResult = {
  bets: Array<Bet>;
  overallStatisticsFlat: { 
    betsCount: number;
    profit: number;
    turnOver: number;
    winRate: number;
    yield: number;
  };
  overallStatisticsReal: { 
    betsCount: number;
    profit: number;
    turnOver: number;
    winRate: number;
    yield: number;
  };
  pageSize: number;
};

const instance = axios.create({
  // withCredentials: true,
  baseURL: domain,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {

    console.log('This is response interceptor error', error, JSON.stringify(error))
    if (error.response && error.response.status === 401) {
      notifyError('Session has expired');
      setTimeout(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }, 1000);
    }
    return Promise.reject(error);
  }
);

const getAllBets = async (
  skipRows: number,
  pageSize: number,
  sort: { 
    sortField: string; 
    sortType: 'asc' | 'desc' 
  }, 
  filter?: {
    betStatus?: 0 | 1,
    betFinished?: Date,
    dateCreatedFrom?: Date,
    dateCreatedTo?: Date,
    stakeFrom?: number,
    stakeTo?: number,
    oddFrom?: number,
    oddTo?: number,
    psLimitFrom?: number,
    psLimitTo?: number,
    counterAgentIDs?: Array<number>,
    sports?: Array<string>,
    markets?: Array<string>,
    tournaments?: Array<string>,
    selections?: Array<string>,
    liveStatuses?: Array<number>,
    currencyIds?: Array<number>,
  }
): Promise<BetsResult | undefined> => {
  try {
    if(sort.sortField === 'id ') {
      sort.sortField = 'Id';
    } else if(sort.sortField === 'winStatus') {
      
    } else if(sort.sortField === 'counterAgent') {

    } else if(sort.sortField === 'sport') {

    } else if(sort.sortField === 'liveStatus') {
      
    } else if(sort.sortField === 'psLimit') {

    } else if(sort.sortField === 'amountBGN') {

    } else if(sort.sortField === 'amountPS USD') {

    } else if(sort.sortField === 'amountEUR') {

    } else if(sort.sortField === 'amountVGP') {

    } else if(sort.sortField === 'market') {

    } else if(sort.sortField === 'selection') {

    } else if(sort.sortField === 'odd') {

    } else if(sort.sortField === 'notes') {
      
    } else if(sort.sortField === 'tournament') {
      
    } else if(sort.sortField === 'stake') {
      
    } else if(sort.sortField === 'dateCreated') {
      
    } else if(sort.sortField === 'dateFinished') {
      
    } else if(sort.sortField === 'totalAmount') {
      
    } else if(sort.sortField === 'profits') {
      
    }

    let url = `${domain}/GetAllBets?SkipRows=${skipRows}&PageSize=${pageSize}&SortField=${sort.sortField}&SortType=${sort.sortType}`;
    if(filter) {
      url = filter.betStatus
        ? url.concat(`&BetStatus=${filter.betStatus}`)
        : url;

      url = filter.betFinished
        ? url.concat(`&BetFinished=${filter.betFinished}`)
        : url;

      url = filter.dateCreatedFrom
        ? url.concat(`&DateCreatedFrom=${filter.dateCreatedFrom}`)
        : url;

      url = filter.dateCreatedTo
        ? url.concat(`&DateCreatedTo=${filter.dateCreatedTo}`)
        : url;

      url = filter.stakeFrom
        ? url.concat(`&StakeFrom=${filter.stakeFrom}`)
        : url;

      url = filter.stakeTo
        ? url.concat(`&StakeTo=${filter.stakeTo}`)
        : url;

      url = filter.oddFrom
        ? url.concat(`&OddFrom=${filter.oddFrom}`)
        : url;

      url = filter.oddTo
        ? url.concat(`&OddTo=${filter.oddTo}`)
        : url;

      url = filter.psLimitFrom
        ? url.concat(`&PsLimitFrom=${filter.psLimitFrom}`)
        : url;

      url = filter.psLimitTo
        ? url.concat(`&PsLimitTo=${filter.psLimitTo}`)
        : url;

      if(filter.counterAgentIDs && filter.counterAgentIDs.length > 0) {
        for(var i = 0; i <= filter.counterAgentIDs.length - 1; i++) {
          const currentCounterAgentId = filter.counterAgentIDs[i];
          url.concat(`&CounterAgentIDs=${currentCounterAgentId}`);
        }
      }

      if(filter.sports && filter.sports.length > 0) {
        for(var i = 0; i <= filter.sports.length - 1; i++) {
          const currentSport = filter.sports[i];
          url.concat(`&Sport=${currentSport}`);
        }
      }

      if(filter.markets && filter.markets.length > 0) {
        for(var i = 0; i <= filter.markets.length - 1; i++) {
          const currentMarket = filter.markets[i];
          url.concat(`&Market=${currentMarket}`);
        }
      }

      if(filter.tournaments && filter.tournaments.length > 0) {
        for(var i = 0; i <= filter.tournaments.length - 1; i++) {
          const currentTournament = filter.tournaments[i];
          url.concat(`&Tournament=${currentTournament}`);
        }
      }

      if(filter.selections && filter.selections.length > 0) {
        for(var i = 0; i <= filter.selections.length - 1; i++) {
          const currentSelection = filter.selections[i];
          url.concat(`&Selection=${currentSelection}`);
        }
      }

      if(filter.liveStatuses && filter.liveStatuses.length > 0) {
        for(var i = 0; i <= filter.liveStatuses.length - 1; i++) {
          const currentLiveStatus = filter.liveStatuses[i];
          url.concat(`&LiveStatus=${currentLiveStatus}`);
        }
      }

      if(filter.currencyIds && filter.currencyIds.length > 0) {
        for(var i = 0; i <= filter.currencyIds.length - 1; i++) {
          const currentCurrencyId = filter.currencyIds[i];
          url.concat(`&CurrencyIDs=${currentCurrencyId}`);
        }
      }
    }

    const getBetsResult = await instance.get(url);
    return getBetsResult.data;
  } catch(e) {
    //alert(JSON.stringify(e));
  }
}

const getBetStatistics = async (props: { 
    id: number; 
    type: StatisticType; 
}): Promise<Statistics | undefined> => {
    try {
        const { id, type, } = props;
        const getBetsResult = 
            await instance.get(`${domain}/GetStatistics?BetId=${id}&StatisticsType=${type}`);
        return { 
            ...getBetsResult.data,
            type,
        };
    } catch(e) {
        //alert(JSON.stringify(e));
    }
}

const getExpenses = async (): Promise<Array<Expense> | undefined> => {
    try {
        const getExpensesResult = await instance.get(`${domain}/GetAllExpenses`);
        return getExpensesResult.data;
    } catch(e) {
        //alert(JSON.stringify(e));
    }
}

const getCounterAgents = async (): Promise<Array<Counteragent> | undefined> => {

    try {
        const getCounterAgentsResult = await instance.get(`${domain}/GetAllCounteragents`);
       
        return getCounterAgentsResult.data
    } catch(e) {
        //alert(JSON.stringify(e));
    }
};

const getCounterAgentsCategories = async (): Promise<Array<string> | undefined> => {
    try {
        const getCounterAgentsCategoriesResult = await instance.get(`${domain}/GetAllCounteragentsCategories`);
        return getCounterAgentsCategoriesResult.data;
    } catch(e) {
        //alert(JSON.stringify(e));
    }
};

const getUsers = async (): Promise<Array<User> | undefined> => {
    try {
        const getUsersResult = await instance.get(`${domain}/GetAllUsers`);
        return getUsersResult.data;
    } catch(e) {
        //alert(JSON.stringify(e));
    }
};

const getCurrencies = async (): Promise<Array<Currency> | undefined> => {
    try {
        const getCurrenciesResult = await instance.get(`${domain}/GetAllCurrencies`);
        return getCurrenciesResult.data;
    } catch(e) {
        //alert(JSON.stringify(e));
    }
};

const getSports = async (): Promise<Array<string> | undefined> => {
    try {
        const getCountaagentsResult = await instance.get(`${domain}/GetAllSports`);
        return getCountaagentsResult.data;
    } catch(e) {
        //alert(JSON.stringify(e));
    }
};

const getTournaments = async (): Promise<Array<string> | undefined> => {
    try {
        const getCountaagentsResult = await instance.get(`${domain}/GetAllTournaments`);
        return getCountaagentsResult.data;
    } catch(e) {
        //alert(JSON.stringify(e));
    }
};

const getMarkets = async (): Promise<Array<string> | undefined> => {
    try {
        const getCountaagentsResult = await instance.get(`${domain}/GetAllMarkets`);
        return getCountaagentsResult.data;
    } catch(e) {
        //alert(JSON.stringify(e));
    }
}

const getSelections = async (): Promise<ISelectionsResult | undefined> => {
    try {
        const getCountaagentsResult = await instance.get(`${domain}/GetAllSelections`);
        return getCountaagentsResult.data;
    } catch(e) {
        //alert(JSON.stringify(e));
    }
}

const deleteBet = async (props: { id: number; }) => {
    try {
        const { id, } = props;
        const deleteBetResult = await instance.delete(`${domain}/DeleteBet`, {
            data: id,
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
            }
        });

        return deleteBetResult.data;
    } catch(e) {
        //alert(JSON.stringify(e));
    }
}

const deleteExpense = async (props: { id: number; }) => {
    try {
        const { id, } = props;
        const deleteExpenseResult = await instance.delete(`${domain}/DeleteExpense`, {
            data: id,
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
            }
        });

        return deleteExpenseResult.data;
    } catch(e) {
        //alert(JSON.stringify(e));
    }
}

const deleteCounteragent = async (props: { id: number; }) => {
    try {
        const { id, } = props;
        const deleteCounteragentResult = await instance.delete(`${domain}/DeleteCounteragent`, {
            data: id,
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
            }
        });

        return deleteCounteragentResult.data;
    } catch(e) {
        //alert(JSON.stringify(e));
    }
}

const deleteCurrency = async (props: { id: number; }) => {
  try {
      const { id, } = props;
      const deleteCurrencyResult = await instance.delete(`${domain}/DeleteCurrency`, {
          data: id,
          headers: {
              'Accept': '*/*',
              'Content-Type': 'application/json',
          }
      });

      return deleteCurrencyResult.data;
  } catch(e) {
      //alert(JSON.stringify(e));
  }
}

const upsertBet = async (bet: BetModel) => {
  try {
    const amounts = Object.fromEntries(
      Object.entries(bet).filter(([key, value]) => key.startsWith('amount')).map(([key, value]) => {
        if(value.constructor === Array) return [];
        return [key.replace('amount', ''), value ? evaluate(value.toString()) : 0 ]
      })
    );

    const request = {
        id: bet.isSavedInDatabase ? Number(bet.id) : null,
        winStatus: bet.winStatus ? Number(bet.winStatus.id) : 0,
        liveStatus: bet.liveStatus ? Number(bet.liveStatus.id) : 0,
        counteragentId: bet.counterAgent ? Number(bet.counterAgent.id) : '',
        sport: bet.sport ? bet.sport.id : '',
        tournament: bet.tournament ? bet.tournament.id : '',
        market: bet.market ? bet.market.id : '',
        stake: bet.stake ? bet.stake : 0,
        psLimit: bet.psLimit ? bet.psLimit : 0,
        currencyAmounts: amounts,
        odd: bet.odd ? bet.odd : 0,
        dateFinished: bet.dateFinished
          ? bet.dateFinished.toISOString().split('T')[0]
          : null,
        profits: bet.profits ? bet.profits : 0,
        notes: bet.notes ? bet.notes : '',
        selection: bet.selection ? bet.selection.label : '',
        color: bet.color ? bet.color : '',
      };
      
    return await instance.post(`${domain}/UpsertBets`, request, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    //alert(JSON.stringify(e));
  }
};

const upsertExpense = async (expense: ExpenseModel) => {
  try {
      const id = expense.isSavedInDatabase
          ? `Id=${expense.id}&`
          : '';
      return await instance.post(`${domain}/UpsertExpense?${id}CounteragentId=${expense.counterAgent?.id}&Description=${expense.description}&Amount=${expense.amount}`);
  } catch(e) {
      //alert(JSON.stringify(e));
  }
};

const upsertCounteragent = async (counteragent: CounteragentModel) => {
  try {
      console.log(`UPSERT COUNTERAGENT - ${JSON.stringify(counteragent)}`);
      const id = counteragent.isSavedInDatabase
          ? `Id=${counteragent.id}&`
          : 'Id=0&';
      return await instance.post(`${domain}/UpsertCounteragent?${id}Name=${counteragent.name}&CounteragentCategory=${counteragent.counteragentCategory?.id}&MaxRate=${counteragent.maxRate}&UserId=${counteragent.user?.id}`);
  } catch(e) {
      //alert(JSON.stringify(e));
  }
};

const upsertCurrency = async (currency: CurrencyModel) => {
  try {
      console.log(`UPSERT CURRENCY - ${JSON.stringify(currency)}`);
      const id = currency.isSavedInDatabase
          ? `Id=${currency.id}&`
          : '';
      await instance.post(`${domain}/UpsertCurrency?${id}Name=${currency.name}&Abbreviation=${currency.abbreviation}&ConversionRateToBGN=${currency.conversionRateToBGN}`);
  } catch(e) {
      //alert(JSON.stringify(e));
  }
};

const getBetHistory = async (betId: number) => {
  try {
      const response = await instance.get(`${domain}/GetBetHistory?betId=${betId}`);
      return response.data;
  } catch(e) {
      //alert(JSON.stringify(e));
  }
};

const getExpenseHistory = async (betId: number) => {
  try {
      const response = await instance.get(`${domain}/GetExpensesHistory?expenseId=${betId}`);
      return response.data;
  } catch(e) {
      //alert(JSON.stringify(e));
  }
};

const login = async (userName: string, password: string) => {
  try {
    return await instance.post(
      `${domain}/Auth/login`,
      { userName, password },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (e) {
    console.log(JSON.stringify(e));
  }
};

const verifyTfa = async (userName: string, code: string) => {
    try {
      const response = await instance.post(
        `${domain}/Auth/verify-tfa`,
        { userName, code },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response;
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  };

const getTfaSetup = async (userName: string) => {
    const tfaSetup = await instance.get(`${domain}/Auth/tfa-setup?userName=${userName}`);
    return tfaSetup;
}

const registerUser = async (user: User) => {
  const { userName, password, email, role } = user;

  try {
    return await instance.post(
      `${domain}/Auth/Register`,
      { userName, password, email, role },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (e) {
    console.log(JSON.stringify(e));
    throw e;
  }
};

const resetPassword = async (email: string) => {
    try {
      return await instance.post(
        `${domain}/Auth/ResetPassword`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (e) {
      console.log(JSON.stringify(e));
    }
};

const deleteUser = async (userName: string) => {
    try {
      return await instance.delete(
        `${domain}/Auth/DeleteUser?userName=${userName}`,
      );
    } catch (e) {
      console.log(JSON.stringify(e));
    }
};

const promoteUserToGA = async (userName: string) => {
  try {
    return await instance.post(
      `${domain}/Auth/PromoteToGA`,
      userName,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (e) {
    console.log(JSON.stringify(e));
    throw e;
  }
};

const demoteUserToRA = async (userName: string) => {
  try {
    return await instance.post(
      `${domain}/Auth/DemoteToRA`,
      userName,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (e) {
    console.log(JSON.stringify(e));
    throw e;
  }
};

const getUserSessions = async (userName: string) => {
  try{
    var sessions =  await instance.get(
      `${domain}/GetUserSessions?userName=${userName}`
    )
    return sessions;
  }catch (e) {
    console.log(JSON.stringify(e));
  }
}

export {
  getAllBets,
  getBetStatistics,
  getBetHistory,
  getExpenseHistory,
  getExpenses,
  getCounterAgents,
  getCounterAgentsCategories,
  getUsers,
  getCurrencies,
  getSports,
  getTournaments,
  getMarkets,
  getSelections,
  deleteBet,
  deleteExpense,
  deleteCounteragent,
  deleteCurrency,
  upsertBet,
  upsertExpense,
  upsertCounteragent,
  upsertCurrency,
  login,
  verifyTfa,
  getTfaSetup,
  registerUser,
  promoteUserToGA,
  demoteUserToRA,
  resetPassword,
  deleteUser,
  getUserSessions,
};