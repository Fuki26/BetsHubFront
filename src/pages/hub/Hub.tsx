import React, { useEffect } from 'react';
import { Box, CircularProgress, FormControlLabel, Paper, Radio, RadioGroup, Typography} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import Bets from '../../components/Bets/Bets';
import { BetModel, ExpenseModel, IDropdownValue, ISelectionsResult, StatisticItemModel } from '../../models';
import { getBetStatistics, getCompletedBets, getCounterAgents, getCurrencies, getExpenses, getMarkets, 
  getPendingBets, getSports, getTournaments } from '../../api';
import { Currency, Expense, Statistics } from '../../database-models';
import { StatisticType, } from '../../models/enums';
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import Expenses from '../../components/Expenses/Expenses';
import { betToBetModelMapper } from '../../utils';

export default function Hub() {
  const [ isLoading, setIsLoading, ] = React.useState<boolean>(false);
  
  const [ selectedBetId, setSelectedBetId, ] = React.useState<number | undefined>(undefined);
  const [ statisticsType, setStatisticsType, ] = React.useState<StatisticType>(StatisticType.Flat);
  const [ currentStatistcs, setCurrentStatistcs, ] = React.useState<Array<StatisticItemModel> | undefined>(undefined);
  
  const [ date, setDate] = React.useState<Date | undefined>(undefined);

  const [ currencies, setCurrencies ] = React.useState<Array<Currency> | undefined>(undefined);
  const [ pendingRows, setPendingRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [ completedRows, setCompletedRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [ filteredPendingRows, setFilteredPendingRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [ filteredCompletedRows, setFilteredCompletedRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [ possibleCounterAgents, setCounterAgents ] = 
    React.useState<Array<IDropdownValue> | undefined>(undefined);
  const [ possibleSports, setSports ] = 
    React.useState<Array<IDropdownValue> | undefined>(undefined);
  const [ possibleTournaments, setTournaments ] = 
    React.useState<Array<IDropdownValue> | undefined>(undefined);
  const [ possibleMarkets, setMarkets ] =
    React.useState<Array<IDropdownValue> | undefined>(undefined);
  const [ possibleSelections, setSelections ] = 
    React.useState<ISelectionsResult | undefined>(undefined);
  const [ expensesRows, setExpensesRows] = React.useState<Array<ExpenseModel> | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        let currencies: Array<Currency> | undefined = await getCurrencies();
        let pendingBets: Array<BetModel> = (await getPendingBets())!.map(betToBetModelMapper);
        let completedBets: Array<BetModel> = (await getCompletedBets())!.map(betToBetModelMapper);
        const getCounteragentsResult = await getCounterAgents();
        // const getSelectionsResult = await getSelections();
        const getSelectionsResult = {
          '1': [
            'Selection 1',
          ],
          '2': [
            'Selection 1',
            'Selection 2',
          ],
          '3': [
            'Selection 1',
            'Selection 2',
            'Selection 3',
          ],
          '4': [
            'Selection 1',
            'Selection 2',
            'Selection 3',
            'Selection 4',
          ],
          '5': [
            'Selection 1',
            'Selection 2',
            'Selection 3',
            'Selection 4',
            'Selection 5'
          ],
        }
        setSelections(getSelectionsResult);
        const getSportsResult = await getSports();
        const getTournamentsResult = await getTournaments();
        const getMarketsResult = await getMarkets();
        
        const getAllExpenses: Array<Expense> | undefined  = await getExpenses();
        setIsLoading(false);

        setPendingRows(pendingBets);
        setCompletedRows(completedBets);
        setCurrencies(currencies);
        setFilteredPendingRows(pendingBets.filter((b) => {
          const now = new Date();
          return b.dateFinished 
            && b.dateFinished.getFullYear() === now.getFullYear()
            && b.dateFinished.getMonth() === now.getMonth()
            && b.dateFinished.getDate() === now.getDate()
        }));
        setFilteredCompletedRows(completedBets.filter((b) => {
          const now = new Date();
          return b.dateFinished 
            && b.dateFinished.getFullYear() === now.getFullYear()
            && b.dateFinished.getMonth() === now.getMonth()
            && b.dateFinished.getDate() === now.getDate()
        }));

        const counterAgents: Array<IDropdownValue> | undefined = 
          getCounteragentsResult
            ? getCounteragentsResult.map((counterAgent: any) => {
                return {
                  id: counterAgent.id.toString(),
                  label: counterAgent.name,
                };
              })
            : [];

        setCounterAgents(counterAgents);

        const sports: Array<IDropdownValue> | undefined =
          getSportsResult
              ? getSportsResult.map((sport) => {
                  return {
                    id: sport,
                    label: sport,
                  };
                })
              : [];
        setSports(sports);

        const markets: Array<IDropdownValue> | undefined =
          getMarketsResult
              ? getMarketsResult.map((market) => {
                  return {
                    id: market,
                    label: market,
                  };
                })
              : [];
        setMarkets(markets);

        const tournaments: Array<IDropdownValue> | undefined =
          getTournamentsResult
              ? getTournamentsResult.map((tournament) => {
                  return {
                    id: tournament,
                    label: tournament,
                  };
                })
              : [];
        setTournaments(tournaments);

        const expenses: Array<ExpenseModel> | undefined = getAllExpenses
                ? getAllExpenses.map((expense) => {
                    return {
                      id: expense.id,
                      counterAgent: expense.counteragent
                        ? {
                            id: expense.counteragent.id.toString(),
                            label: expense.counteragent.name
                          }
                        : undefined,
                      amount: expense.amount,
                      description: expense.description,
                      dateCreated: new Date(expense.dateCreated),
          
                      actionTypeApplied: undefined,
                      isSavedInDatabase: true,
                    };
                  })
                : [];

        setExpensesRows(expenses);
        setDate(new Date());
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    setFilteredPendingRows((previousRowsModel: Array<BetModel> | undefined) => {
      if(pendingRows && date) {
        const bets: Array<BetModel> = [];
        for(var i = 0; i <= pendingRows?.length - 1; i++) {
          const currentRow = pendingRows[i];
          if(currentRow.dateFinished 
            && currentRow.dateFinished.getFullYear() === date.getFullYear()
            && currentRow.dateFinished.getMonth() === date.getMonth()
            && currentRow.dateFinished.getDate() === date.getDate()) {
              bets.push(currentRow);
          }
        }

        return bets;
      } else {
        return [];
      }
    });

    setFilteredCompletedRows((previousRowsModel: Array<BetModel> | undefined) => {
      if(completedRows && date) {
        const bets: Array<BetModel> = [];
        for(var i = 0; i <= completedRows?.length - 1; i++) {
          const currentRow = completedRows[i];
          if(currentRow.dateFinished 
            && currentRow.dateFinished.getFullYear() === date.getFullYear()
            && currentRow.dateFinished.getMonth() === date.getMonth()
            && currentRow.dateFinished.getDate() === date.getDate()) {
              bets.push(currentRow);
          }
        }

        return bets;
      } else {
        return [];
      }
    });
  }, [ date, ]);


  useEffect(() => {
    (async () => {
      try {
        if(!selectedBetId) {
          return;
        }
        
        let betStatistics: Statistics | undefined = await getBetStatistics({
          id: selectedBetId,
          type: statisticsType,
        });

        if(!betStatistics) {
          return;
        }

        const statisticsModel: Array<StatisticItemModel> = [
          {
            id: 1,
            periodType: 'CalendarBased',
            profit: betStatistics.current.profit,
            turnOver: betStatistics.current.turnOver,
            winRate: betStatistics.current.winRate,
            yield: betStatistics.current.yield,
          },
          {
            id: 2,
            periodType: '3mTillToday',
            profit: betStatistics.threeMonths.profit,
            turnOver: betStatistics.threeMonths.turnOver,
            winRate: betStatistics.threeMonths.winRate,
            yield: betStatistics.threeMonths.yield,
          },
          {
            id: 3,
            periodType: '6mTillToday',
            profit: betStatistics.sixMonths.profit,
            turnOver: betStatistics.sixMonths.turnOver,
            winRate: betStatistics.sixMonths.winRate,
            yield: betStatistics.sixMonths.yield,
          },
        ];

        setCurrentStatistcs(statisticsModel);
      } catch (e) {
        console.error(e);
      }
    })()
  }, [ selectedBetId, statisticsType]);

  const selectedDateFn = (value: Date | null) => {
    setDate((value! as any).$d as Date);
  };

  const selectBetId = async (id: number) => {
    setSelectedBetId(id);
    return id;
  };

  const statisticsColumns: Array<GridColDef<any>> = [
    {
      field: 'id',
      type: 'number',
    },
    {
      field: 'periodType',
      headerName: 'Period',
      type: 'string',
      width: 150,
    },
    {
      field: 'profit',
      headerName: 'Profit',
      type: 'number',
      width: 150,
    },
    {
      field: 'turnOver',
      headerName: 'Turnover',
      type: 'number',
      width: 150,
    },
    {
      field: 'winRate',
      headerName: 'Win Rate',
      type: 'number',
      width: 150,
    },
    {
      field: 'yield',
      headerName: 'Yield',
      type: 'number',
      width: 150,
    },
  ];

  return (
    <Paper sx={{ padding: '5%', }}>
      {
        isLoading
          ? (
              <>
                <CircularProgress color="success" 
                  size={250}
                  disableShrink={true}
                  style={{
                    position: 'fixed', 
                    top: '40%', 
                    right: '50%', 
                    zIndex: 9999999999999,
                    transition: 'none',
                  }}

                />
              </>
              
            )
          : null
      }
      {
        currentStatistcs
          ? (
              <Paper>
                <Typography variant='h4'>Statistics</Typography>
                <RadioGroup
                  aria-labelledby="demo-controlled-radio-buttons-group"
                  name="controlled-radio-buttons-group"
                  value={statisticsType}
                  onChange={(event) => {
                    const value: string = (event.target as HTMLInputElement).value;
                    setStatisticsType(value === 'Flat' 
                      ? StatisticType.Flat
                      : StatisticType.Real);
                  }}
                >
                  <FormControlLabel value="Flat" control={<Radio />} label="Flat" />
                  <FormControlLabel value="Real" control={<Radio />} label="Real" />
                </RadioGroup>
                <DataGridPro
                  columns={statisticsColumns}
                  rows={currentStatistcs}
                />
              </Paper>
            )
          : null
      }
      
      <Paper style={{ display: 'flex', flexWrap: 'nowrap' }}>
        <Paper>
          <Paper style={{ paddingTop: '40%' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar onChange={selectedDateFn}/>
            </LocalizationProvider>
          </Paper>
        </Paper>
        <Paper>
          {
            pendingRows
              ? (
                  <>
                    <Typography variant='h4'>PENDING</Typography>
                    <Bets
                      arePengindBets={true}
                      isRead={false}
                      selectBetIdFn={selectBetId}
                      setIsLoading={setIsLoading} 
                      defaultRows={pendingRows}
                      currencies={currencies}
                      possibleCounteragents={possibleCounterAgents}
                      possibleSports={possibleSports}
                      possibleTournaments={possibleTournaments}
                      possibleMarkets={possibleMarkets}
                      allSelections={possibleSelections ? possibleSelections : {}}
                    />
                  </> 
                )
              : null
          }
          {
            filteredCompletedRows
              ? (
                  <>
                    <Typography variant='h4'>COMPLETED</Typography>
                    <Bets
                      arePengindBets={false}
                      isRead={true} 
                      selectBetIdFn={selectBetId}
                      setIsLoading={setIsLoading}
                      defaultRows={filteredCompletedRows}
                      currencies={currencies}
                      possibleCounteragents={possibleCounterAgents}
                      possibleSports={possibleSports}
                      possibleTournaments={possibleTournaments}
                      possibleMarkets={possibleMarkets}
                      allSelections={possibleSelections ? possibleSelections : {}}
                    />
                  </>
                )
              : null
          }
        </Paper>
      </Paper>
      {
        expensesRows
          ? (
              <>
                <Typography variant='h4'>Expenses</Typography>
                <Expenses 
                  isRead={false}
                  setIsLoading={setIsLoading}
                  defaultRows={expensesRows}
                  possibleCounterAgents={possibleCounterAgents}
                />
              </>
            )
          : null
      }
      
    </Paper>
  );
}
