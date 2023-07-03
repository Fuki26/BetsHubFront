import axios from 'axios';
import { Bet, Counteragent, CounterAgentCategory, Currency, Expense, Statistics, User, } from '../database-models';
import { BetModel, CounteragentModel, CurrencyModel, ExpenseModel, ISelectionsResult, } from '../models';
import { StatisticType } from '../models/enums';

const domain = 'http://213.91.236.205:5000';
// const domain = 'http://localhost:5001'

const instance = axios.create({
    withCredentials: true,
    baseURL: domain
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

const getPendingBets = async (): Promise<Array<Bet> | undefined> => {
    try {
        const getBetsResult = 
            await instance.get(`${domain}/GetAllBets?StartIndex=0&Count=5000&BetStatus=0`);
        return getBetsResult.data;
    } catch(e) {
        //alert(JSON.stringify(e));
    }
}

const getCompletedBets = async (): Promise<Array<Bet> | undefined> => {
    try {
        const getBetsResult = await instance.get(`${domain}/GetAllBets?StartIndex=0&Count=5000&BetStatus=1`);
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
        return getCounterAgentsResult.data;
    } catch(e) {
        //alert(JSON.stringify(e));
    }
};

const getCounterAgentsCategories = async (): Promise<Array<CounterAgentCategory> | undefined> => {
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
        Object.entries(bet).filter(([key, value]) => key.startsWith("amount")).map(([key, value]) => [key.replace('amount', ''), value])
      );

    const request = {
        id: bet.isSavedInDatabase ? Number(bet.id) : null,
        winStatus: bet.winStatus ? Number(bet.winStatus.id) : 0,
        counteragentId: bet.counterAgent ? Number(bet.counterAgent.id) : "",
        sport: bet.sport ? bet.sport.id : "",
        tournament: bet.tournament ? bet.tournament.id : "",
        market: bet.market ? bet.market.id : "",
        stake: bet.stake ? bet.stake : 0,
        psLimit: bet.psLimit ? bet.psLimit : 0,
        currencyAmounts: amounts,
        odd: bet.odd ? bet.odd : 0,
        dateFinished: bet.dateFinished
          ? bet.dateFinished.toISOString().split("T")[0]
          : null,
        profits: bet.profits ? bet.profits : 0,
        notes: bet.notes ? bet.notes : "",
        selection: bet.selection ? bet.selection.label : "",
      };
      
    return await instance.post(`${domain}/UpsertBets`, request, {
      headers: {
        "Content-Type": "application/json",
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
      return await instance.post(`${domain}/UpsertCounteragent?${id}Name=${counteragent.name}&CounteragentCategoryId=${counteragent.counteragentCategory?.id}&MaxRate=${counteragent.maxRate}&UserId=${counteragent.user?.id}`);
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

const login = async (userName: string, password: string) => {
  try {
    return await instance.post(
      `${domain}/Auth/login`,
      { userName, password },
      {
        headers: {
          "Content-Type": "application/json",
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
            "Content-Type": "application/json",
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
          "Content-Type": "application/json",
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
            "Content-Type": "application/json",
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
  getPendingBets,
  getCompletedBets,
  getBetStatistics,
  getBetHistory,
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
  resetPassword,
  deleteUser,
  getUserSessions,
};