import React, { useEffect } from 'react';
import { CircularProgress, FormControlLabel, Checkbox, Switch, Grid, Paper, 
  Radio, RadioGroup, Typography, } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { useLocation } from "react-router-dom";
import Bets from '../../components/Bets/Bets';
import { BetModel, ExpenseModel, IDropdownValue, StatisticItemModel, } from '../../models';
import { getBetStatistics, getCompletedBets, getCounterAgents, getCurrencies, 
  getExpenses, getMarkets, getPendingBets, getSelections, getSports, getTournaments,
} from '../../api';
import { Currency, Expense, Statistics } from '../../database-models';
import { StatisticType } from '../../models/enums';
import Expenses from '../../components/Expenses/Expenses';
import { betToBetModelMapper } from '../../utils';


dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  weekStart: 1
});

export default function Hub(props: {
  id: 'pending_bets' | 'completed_bets' | 'expenses';
}) {
  const { id, } = props;
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSticky, setIsSticky]=React.useState<boolean>(false);
  const [isOpenedCalendar, setIsOpenedCalendar]=React.useState<boolean>(true);
  const location = useLocation();

  const [selectedBetId, setSelectedBetId] = React.useState<number | undefined>(undefined);
  const [statisticsType, setStatisticsType] = React.useState<StatisticType>(StatisticType.Flat);
  const [currentStatistcs, setCurrentStatistcs] = React.useState<Array<StatisticItemModel> | undefined>(undefined);
  const [isPendingTableExpanded, setPendingTableExpanded] = React.useState<boolean>(true);
  const [isCompletedTableExpanded, setCompletedTableExpanded] = React.useState<boolean>(true);
  const [isExpensesTableExpanded, setExpensesTableExpanded] = React.useState<boolean>(true);

  const [date, setDate] = React.useState<Date | undefined>(undefined);

  const [currencies, setCurrencies] = React.useState<Array<Currency> | undefined>(undefined);
  const [pendingRows, setPendingRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [completedRows, setCompletedRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [filteredCompletedRows, setFilteredCompletedRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [possibleCounterAgents, setCounterAgents] = React.useState<Array<IDropdownValue> | undefined>(undefined);
  const [possibleSports, setSports] = React.useState<Array<IDropdownValue> | undefined>(undefined);
  const [possibleTournaments, setTournaments] = React.useState<Array<IDropdownValue> | undefined>(undefined);
  const [possibleMarkets, setMarkets] = React.useState<Array<IDropdownValue> | undefined>(undefined);
  const [possibleSelections, setSelections] = React.useState<Array<{ id: number; selections: Array<IDropdownValue> | undefined, }>>([]);
  const [expensesRows, setExpensesRows] = React.useState<Array<ExpenseModel> | undefined>(undefined);
  const [filteredExpensesRows, setFilteredExpensesRows] = React.useState<Array<ExpenseModel> | undefined>(undefined);

  const [totalOfTotalsPending, setTotalOfTotalsPending ] = React.useState<number>(0);
  const [totalOfTotalsCompleted, setTotalOfTotalsCompleted ] = React.useState<number>(0);
  const [totalOfProfitsCompleted, setTotalOfProfitsCompleted ] = React.useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        let currencies: Array<Currency> | undefined = await getCurrencies();
        let pendingBets: Array<BetModel> = (await getPendingBets())!.map(
          betToBetModelMapper
        );
        let completedBets: Array<BetModel> = (await getCompletedBets())!.map(
          betToBetModelMapper
        );
        const getCounteragentsResult = await getCounterAgents();
        const getSelectionsResult = await getSelections();

        const mappedSelections: Array<{ id: number; selections: Array<IDropdownValue> | undefined, }> = [];
        for (let key in getSelectionsResult) {
          if (getSelectionsResult.hasOwnProperty(key)) {
            mappedSelections.push({
              id: parseInt(key),
              selections: getSelectionsResult[key].map((selection: string) => {
                return {
                  id: selection,
                  label: selection,
                }
              })
            })
          }
        }

        setSelections(mappedSelections);
        const getSportsResult = await getSports();
        const getTournamentsResult = await getTournaments();
        const getMarketsResult = await getMarkets();

        const getAllExpenses: Array<Expense> | undefined = await getExpenses();
        setIsLoading(false);

        setPendingRows(pendingBets);
        setCompletedRows(completedBets);

        let calculatedTotalOfTotalsPending = pendingBets
          ? pendingBets.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.totalAmount) {
                return accumulator + currentValue.totalAmount;
              } else {
                return accumulator;
              }
            }, 0)
          : 0;
        setTotalOfTotalsPending(calculatedTotalOfTotalsPending);

        setCurrencies(currencies);
        const completedBetsFilteredByDate = completedBets.filter((b) => {
          const now = new Date();
          return (
            b.dateFinished &&
            b.dateFinished.getFullYear() === now.getFullYear() &&
            b.dateFinished.getMonth() === now.getMonth() &&
            b.dateFinished.getDate() === now.getDate()
          );
        });
        setFilteredCompletedRows(completedBetsFilteredByDate);
        
        let calculatedTotalOfTotalsCompleted = completedBetsFilteredByDate
          ? completedBetsFilteredByDate.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.totalAmount) {
                return accumulator + currentValue.totalAmount;
              } else {
                return accumulator;
              }
            }, 0)
          : 0;
        setTotalOfTotalsCompleted(calculatedTotalOfTotalsCompleted);

        let calculatedTotalOfProfitsCompleted = completedBetsFilteredByDate
          ? completedBetsFilteredByDate.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.profits) {
                return accumulator + Number(currentValue.profits);
              } else {
                return accumulator;
              }
            }, 0)
          : 0;
        setTotalOfProfitsCompleted(calculatedTotalOfProfitsCompleted);

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

        const sports: Array<IDropdownValue> | undefined = getSportsResult
          ? getSportsResult.map((sport) => {
              return {
                id: sport,
                label: sport,
              };
            })
          : [];
        setSports(sports);

        const markets: Array<IDropdownValue> | undefined = getMarketsResult
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
                      label: expense.counteragent.name,
                    }
                  : undefined,
                amount: Number(expense.amount.toFixed(2)),
                description: expense.description,
                dateCreated: new Date(expense.dateCreated),

                actionTypeApplied: undefined,
                isSavedInDatabase: true,
              };
            })
          : [];

        setExpensesRows(expenses);
        setFilteredExpensesRows((previousRowsModel: Array<ExpenseModel> | undefined) => {
          const now = new Date();
          return expenses
            .filter((e) => {
              if(
                e.dateCreated &&
                e.dateCreated.getFullYear() === now.getFullYear() &&
                e.dateCreated.getMonth() === now.getMonth() &&
                e.dateCreated.getDate() === now.getDate()
              ) {
                return true;
              } else {
                return false;
              }
            })
            .sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime());
        });
        setDate(new Date());
      } catch (e) {
        console.error(e);
      }
    })();
  }, [location]);

  useEffect(() => {
    const filteredCompletedBetsByDate: Array<BetModel> = [];
    if (completedRows && date) {
      for (var i = 0; i <= completedRows?.length - 1; i++) {
        const currentRow = completedRows[i];
        if (
          currentRow.dateFinished &&
          currentRow.dateFinished.getFullYear() === date.getFullYear() &&
          currentRow.dateFinished.getMonth() === date.getMonth() &&
          currentRow.dateFinished.getDate() === date.getDate()
        ) {
          filteredCompletedBetsByDate.push(currentRow);
        }
      }
    }

    setFilteredCompletedRows(filteredCompletedBetsByDate);

    let calculatedTotalOfTotalsCompleted = filteredCompletedBetsByDate
          ? filteredCompletedBetsByDate.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.totalAmount) {
                return accumulator + currentValue.totalAmount;
              } else {
                return accumulator;
              }
            }, 0)
          : 0;
    setTotalOfTotalsCompleted(calculatedTotalOfTotalsCompleted);

    let calculatedTotalOfProfitsCompleted = filteredCompletedBetsByDate
          ? filteredCompletedBetsByDate.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.profits) {
                return accumulator + Number(currentValue.profits);
              } else {
                return accumulator;
              }
            }, 0)
          : 0;
    setTotalOfProfitsCompleted(calculatedTotalOfProfitsCompleted);

    setFilteredExpensesRows((previousRowsModel: Array<ExpenseModel> | undefined) => {
      let filteredExpenses: Array<ExpenseModel> = [];
      if (expensesRows) {
        if(date) {
          filteredExpenses = expensesRows
            .filter((e) => {
              if(
                e.dateCreated &&
                e.dateCreated.getFullYear() === date.getFullYear() &&
                e.dateCreated.getMonth() === date.getMonth() &&
                e.dateCreated.getDate() === date.getDate()
              ) {
                return true;
              } else {
                return false;
              }
            })
            ;
        } else {
          filteredExpenses = expensesRows;
        }
      }

      return filteredExpenses
        .sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime());
    });
  }, [date]);

  useEffect(() => {
    (async () => {
      try {
        if (!selectedBetId) {
          return;
        }

        let betStatistics: Statistics | undefined = await getBetStatistics({
          id: selectedBetId,
          type: statisticsType,
        });

        if (!betStatistics) {
          return;
        }

        const statisticsModel: Array<StatisticItemModel> = [
          {
            id: 1,
            periodType: 'all time',
            profit: betStatistics.current.profit,
            turnOver: betStatistics.current.turnOver,
            winRate: (betStatistics.current.winRate * 100) + '%',
            yield: (betStatistics.current.yield * 100) + '%',
          },
          {
            id: 2,
            periodType: 'last 3m',
            profit: betStatistics.threeMonths.profit,
            turnOver: betStatistics.threeMonths.turnOver,
            winRate: (betStatistics.threeMonths.winRate * 100) + '%',
            yield: (betStatistics.threeMonths.yield * 100) + '%',
          },
          {
            id: 3,
            periodType: 'last 6m',
            profit: betStatistics.sixMonths.profit,
            turnOver: betStatistics.sixMonths.turnOver,
            winRate: (betStatistics.sixMonths.winRate * 100) + '%',
            yield: (betStatistics.sixMonths.yield * 100) + '%',
          },
        ];

        setCurrentStatistcs(statisticsModel);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedBetId, statisticsType]);

  const selectedDateFn = (value: Date | null) => {
    setDate((value! as any).$d as Date);
  };

  const selectBetId = async (id: number) => {
    setSelectedBetId(id);
    return id;
  };

  const savedPendingBet = async (bets: Array<BetModel>, bet: BetModel) => {
    setCompletedRows((previousRowsModel) => {
      if(!previousRowsModel) {
        return [
          bet,
        ];
      }

      const existingBet = previousRowsModel.find((b) => b.id === bet.id);
      if(!existingBet) {
        previousRowsModel.push({
          ...bet, 
          actionTypeApplied: undefined,
          isSavedInDatabase: true,
        });
      }
      
      return previousRowsModel;
    });

    if(completedRows) {
      const filteredCompletedRowsByDate = completedRows.filter((b) => {
        const now = new Date();
        return (
          b.dateFinished &&
          b.dateFinished.getFullYear() === now.getFullYear() &&
          b.dateFinished.getMonth() === now.getMonth() &&
          b.dateFinished.getDate() === now.getDate()
        );
      });

      setFilteredCompletedRows(filteredCompletedRowsByDate);

      let calculatedTotalOfTotalsCompleted = filteredCompletedRowsByDate
          ? filteredCompletedRowsByDate.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.totalAmount) {
                return accumulator + currentValue.totalAmount;
              } else {
                return accumulator;
              }
            }, 0)
          : 0;
      setTotalOfTotalsCompleted(calculatedTotalOfTotalsCompleted);

      let calculatedTotalProfisCompleted = filteredCompletedRowsByDate
          ? filteredCompletedRowsByDate.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.profits) {
                return accumulator + Number(currentValue.profits);
              } else {
                return accumulator;
              }
            }, 0)
          : 0;
      setTotalOfProfitsCompleted(calculatedTotalProfisCompleted);
    } else {
      setFilteredCompletedRows([]);
      setTotalOfTotalsCompleted(0);
      setTotalOfProfitsCompleted(0);
    }
    
    return;
  }

  const statisticsColumns: Array<GridColDef<any>> = [
    {
      field: 'id',
      type: 'number',
    },
    {
      field: 'periodType',
      headerName: 'Period',
      type: 'string',
      width: 100,
    },
    {
      field: 'profit',
      headerName: 'Profit',
      type: 'number',
      width: 100,
    },
    {
      field: 'turnOver',
      headerName: 'Turnover',
      type: 'number',
      width: 100,
    },
    {
      field: 'winRate',
      headerName: 'Win Rate',
      type: 'number',
      width: 100,
    },
    {
      field: 'yield',
      headerName: 'Yield',
      type: 'number',
      width: 100,
    },
  ];

  const handleExpandClick = () => {
    setPendingTableExpanded(!isPendingTableExpanded);
  };

  const handleExpandClickCompleted = () => {
    setCompletedTableExpanded(!isCompletedTableExpanded);
  };

  const handleExpandClickExpenses = () => {
    setExpensesTableExpanded(!isExpensesTableExpanded);
  };

  const totalOfTotalAmountsForPendingChangedHandler = (totalOfTotals: number) => {
    setTotalOfTotalsPending(totalOfTotals);
  }

  const totalOfTotalAmountsForCompletedChangedHandler = (totalOfTotals: number) => {
    setTotalOfTotalsCompleted(totalOfTotals);
  }

  const totalOfProfitsForCompletedChangedHandler = (totalOfProfits: number) => {
    setTotalOfProfitsCompleted(totalOfProfits);
  }

  return (
    <>
      {
        isLoading 
          ? (
              <>
                <div className='background-color-blur'>
                  <CircularProgress
                    color='success'
                    size={250}
                    disableShrink={true}
                    style={{
                      position: 'fixed', 
                      top: '0', 
                      right: '0',
                      bottom: '0',
                      left: '0',
                      margin: 'auto',
                      zIndex: 9999999999999,
                      transition: 'none',
                    }}
                  />
                </div>
              </>
            ) 
          : null
      }

      <Paper sx={{ padding: '5%' ,width:'100% !important'}}>
        {
          id === 'pending_bets' || id === 'completed_bets'
            ? (
                <Paper className='parent-statistics' style={{ maxWidth: '70vw !important', display: 'flex', zIndex: '1', top: '60px', position: isSticky ? 'sticky' : 'static' }}>
                  <Paper className='statistics' style={{ marginRight: 'auto', }}>
                    <Typography variant='h4'>Statistics</Typography>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <RadioGroup
                        aria-labelledby='demo-controlled-radio-buttons-group'
                        name='controlled-radio-buttons-group'
                        value={statisticsType}
                        onChange={(event) => {
                          const value: string = (event.target as HTMLInputElement).value;
                          setStatisticsType(
                            value === 'Flat' ? StatisticType.Flat : StatisticType.Real
                          );
                        }}
                      >
                        <FormControlLabel value='Flat' control={<Radio />} label='Flat' />
                        <FormControlLabel value='Real' control={<Radio />} label='Real' />
                      </RadioGroup>
        
                      <FormControlLabel
                        onChange={() => {
                          setIsSticky(!isSticky)
                          console.log(isSticky)
                        }} control={<Checkbox />} label='Sticky' 
                      />
                    </div>
                    <DataGrid 
                      style={{ height: '70%', borderWidth: '0' }} 
                      columns={statisticsColumns}
                      rows={currentStatistcs || []}
                      pageSizeOptions={[]}
                      autoPageSize={false}
                      hideFooterPagination
                    />
                  </Paper>
                </Paper>
              )
            : null
        }

        {
          id === 'completed_bets' || id === 'expenses'
            ? (
                <Paper className='calendar-container'>
                  <div className='switch-calendar'>
                    <FormControlLabel 
                      onClick={() => {
                        setIsOpenedCalendar(!isOpenedCalendar)
                      }} 
                      control={<Switch defaultChecked />} 
                      label='Calendar' 
                    />
                  </div>
                  <div style={{ display: isOpenedCalendar ? 'flex' : 'none' }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateCalendar onChange={selectedDateFn} />
                    </LocalizationProvider>
                  </div>
                </Paper>
              )
            : null
        }

        <Paper  style={{ display: 'flex', flexWrap: 'nowrap' }}>
          <Paper style={{width:'100%'}}>
            {
              pendingRows && id === 'pending_bets'
                ? (
                    <>
                      <Grid item xs={12} sx={{ maxWidth: '90vw !important' }}>
                        <Typography variant='h4'>
                          PENDING
                          <IconButton
                            onClick={handleExpandClick}
                            aria-expanded={isPendingTableExpanded}
                            aria-label='show more'
                            sx={{
                              transform: isPendingTableExpanded
                                ? 'rotate(0deg)'
                                : 'rotate(180deg)',
                              transition: 'transform 0.3s',
                            }}
                          >
                            <ExpandMoreIcon />
                          </IconButton>
                        </Typography>
                        <Paper style={{
                          marginLeft: '60%',
                        }}>
                          Turnover: 
                          {Number(totalOfTotalsPending).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Paper>
                        <Collapse
                          in={isPendingTableExpanded}
                          timeout='auto'
                          unmountOnExit
                        >
                          <Bets
                            id='pending'
                            arePengindBets={true}
                            savedBet={savedPendingBet}
                            selectBetIdFn={selectBetId}
                            setIsLoading={setIsLoading}
                            notificationTotalOfTotalAmountsChanged={totalOfTotalAmountsForPendingChangedHandler}
                            defaultRows={pendingRows}
                            currencies={currencies}
                            possibleCounteragents={possibleCounterAgents}
                            possibleSports={possibleSports}
                            possibleTournaments={possibleTournaments}
                            possibleSelections={possibleSelections}
                            possibleMarkets={possibleMarkets}
                          />
                        </Collapse>
                      </Grid>
                    </>
                ) 
                : null
            }
            {
              filteredCompletedRows && id === 'completed_bets'
                ? (
                    <>
                      <Grid item xs={12} sx={{ maxWidth: '90vw !important' }}>
                        <Typography variant='h4'>
                          COMPLETED
                          <IconButton
                            onClick={handleExpandClickCompleted}
                            aria-expanded={isCompletedTableExpanded}
                            aria-label='show more'
                            sx={{
                              transform: isCompletedTableExpanded
                                ? 'rotate(0deg)'
                                : 'rotate(180deg)',
                              transition: 'transform 0.3s',
                            }}
                          >
                            <ExpandMoreIcon />
                          </IconButton>
                        </Typography>
                        <Paper style={{
                            marginLeft: '60%',
                          }}>
                            Turnover: 
                            {Number(totalOfTotalsCompleted).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}

                            { '  Profit:'} 
                            {Number(totalOfProfitsCompleted).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                        </Paper>
                        <Collapse in={isCompletedTableExpanded} timeout='auto' unmountOnExit>
                          <Bets
                            id='completed'
                            arePengindBets={false}
                            savedBet={savedPendingBet}
                            notificationTotalOfTotalAmountsChanged={totalOfTotalAmountsForCompletedChangedHandler}
                            notificationTotalProfitsChanged={totalOfProfitsForCompletedChangedHandler}
                            selectBetIdFn={selectBetId}
                            setIsLoading={setIsLoading}
                            defaultRows={filteredCompletedRows}
                            currencies={currencies}
                            possibleCounteragents={possibleCounterAgents}
                            possibleSports={possibleSports}
                            possibleTournaments={possibleTournaments}
                            possibleSelections={possibleSelections}
                            possibleMarkets={possibleMarkets}
                          />
                        </Collapse>
                      </Grid>
                    </>
                  ) 
              : null
            }
          </Paper>
        </Paper>

        {
          filteredExpensesRows && id === 'expenses'
            ? 
              (
                <>
                  <Grid item xs={12} sx={{ maxWidth: '90vw !important' }}>
                    <Typography variant='h4'>
                      Expenses
                      <IconButton
                        onClick={handleExpandClickExpenses}
                        aria-expanded={isExpensesTableExpanded}
                        aria-label='show more'
                        sx={{
                          transform: isExpensesTableExpanded
                            ? 'rotate(0deg)'
                            : 'rotate(180deg)',
                          transition: 'transform 0.3s',
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Typography>
                    <Collapse sx={{ maxWidth: '90vw !important' }} in={isExpensesTableExpanded} timeout='auto' unmountOnExit>
                    <Expenses
                      displayExportToolbar={false}
                      isRead={false}
                      setIsLoading={setIsLoading}
                      defaultRows={filteredExpensesRows}
                      possibleCounterAgents={possibleCounterAgents}
                    />
                    </Collapse>
                  </Grid>
                </>
            ) 
            : null
        }
      </Paper>
    </>
  );
}
