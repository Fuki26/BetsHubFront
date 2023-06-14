import React, { useEffect } from 'react';
import { Autocomplete, Checkbox, CircularProgress, FormControlLabel, 
  Paper, Radio, RadioGroup, TextField, Typography} from '@mui/material';
  import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import dayjs from 'dayjs';
import Bets from '../../components/Bets/Bets';
import { BetModel, ExpenseModel, ISelectionsResult, StatisticItemModel } from '../../models';
import { getBetStatistics, getCounteragents, getCurrencies, getExpenses, getMarkets, 
  getPendingBets, getSports, getTournaments } from '../../api';
import { Bet, Currency, Expense, Statistics } from '../../database-models';
import { StatisticType } from '../../models/enums';
import Expenses from '../../components/Expenses/Expenses';


const betToBetModelMapper = (bet: Bet) => {
  return {
    id: bet.id,
    dateCreated: new Date(bet.dateCreated),
    betStatus: bet.betStatus,
    winStatus: bet.winStatus,
    stake: bet.stake,
    counteragentId: bet.counteragentId,
    counteragent: bet.counteragent
      ? bet.counteragent.name
      : '',
    sport:	bet.sport,
    liveStatus:	bet.liveStatus, 
    psLimit: bet.psLimit,
    market: bet.market,
    tournament: bet.tournament,
    selection: bet.selection,
    amountBGN: bet.amountBGN,
    amountEUR: bet.amountEUR,
    amountUSD: bet.amountUSD,
    amountGBP: bet.amountGBP,
    odd: bet.odd,
    dateFinished: bet.dateFinished
      ? new Date(bet.dateFinished)
      : null,
    profits: bet.profits,
    notes: bet.notes,

    actionTypeApplied: undefined,
    isSavedInDatabase: true,
  } as BetModel;
};

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function Search() {
  const [ isLoading, setIsLoading, ] = React.useState<boolean>(false);
  
  const [ selectedBetId, setSelectedBetId, ] = React.useState<number | undefined>(undefined);
  const [ statisticsType, setStatisticsType, ] = React.useState<StatisticType>(StatisticType.Flat);
  const [ currentStatistcs, setCurrentStatistcs, ] = React.useState<Array<StatisticItemModel> | undefined>(undefined);
  
  //#region Filters

  const [ dateFrom, setDateFrom] = React.useState<Date | undefined>(undefined);
  const [ dateTo, setDateTo] = React.useState<Date | undefined>(undefined);
  const [ stakeFrom, setStakeFrom] = React.useState<number | undefined>(undefined);
  const [ stakeTo, setStakeTo] = React.useState<number | undefined>(undefined);
  const [ oddFrom, setOddFrom] = React.useState<number | undefined>(undefined);
  const [ oddTo, setOddTo] = React.useState<number | undefined>(undefined);
  const [ psLimitFrom, setPsLimitFrom] = React.useState<number | undefined>(undefined);
  const [ psLimitTo, setPsLimitTo] = React.useState<number | undefined>(undefined);

  const [ counteragentCategoriesIds, setCounteragentCategoriesIds ] = React.useState<Array<number> | undefined>(undefined);
  const [ counteragentIds, setCounteragentIds ] = React.useState<Array<number> | undefined>(undefined);
  const [ sportIds, setSportIds ] = React.useState<Array<string> | undefined>(undefined);
  const [ marketIds, setMarketIds ] = React.useState<Array<string> | undefined>(undefined);
  const [ tournamentIds, setTournamentIds ] = React.useState<Array<string> | undefined>(undefined);
  const [ liveStatusIds, setLiveStatusIds ] = React.useState<Array<number> | undefined>(undefined);

  //#endregion Filters


  const [ rows, setRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [ filteredRows, setFilteredRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [ expensesRows, setExpensesRows] = React.useState<Array<ExpenseModel> | undefined>(undefined);
  const [ filteredExpensesRows, setFilteredExpensesRows] = React.useState<Array<ExpenseModel> | undefined>(undefined);


  const [ allCounteragents, setAllCounteragents ] = React.useState<Array<{ value: string; label: string; }> | undefined>(undefined);
  const [ allSelections, setAllSelections ] = React.useState<ISelectionsResult | undefined>(undefined);
  const [ allSports, setAllSports ] = React.useState<Array<{ value: string; label: string; }> | undefined>(undefined);
  const [ allTournaments, setAllTournaments ] = React.useState<Array<{ value: string; label: string; }> | undefined>(undefined);
  const [ allMarkets, setAllMarkets ] = React.useState<Array<{ value: string; label: string; }> | undefined>(undefined);
  const [ allCurrencies, setAllCurrencies ] = React.useState<Array<Currency> | undefined>(undefined);
  

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        //#region Bets

        let bets: Array<BetModel> = (await getPendingBets())!.map(betToBetModelMapper);
        setRows(bets);
        const dateFrom: Date = new Date();
        dateFrom.setMonth(dateFrom.getMonth() - 1);
        const now = new Date();
        setFilteredRows(bets.filter((b) => {
          if(b.dateFinished) {
            return b.dateFinished.getTime() > dateFrom.getTime()
              && b.dateFinished.getTime() < now.getTime();
          } else {
            return false;
          }
        }));

        //#endregion Bets

        //#region Expenses

        const getExpensesResult: Array<Expense> | undefined  = await getExpenses();
        const expenses: Array<ExpenseModel> | undefined = getExpensesResult
                ? getExpensesResult.map((expense) => {
                    return {
                      id: expense.id,
                      counteragentId: expense.counteragentId
                        ? expense.counteragentId
                        : undefined,
                      counteragent: expense.counteragent
                        ? expense.counteragent.name
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
        setFilteredExpensesRows(expenses.filter((e) => {
          return e.dateCreated.getTime() > dateFrom.getTime()
            && e.dateCreated.getTime() < now.getTime();
        }));


        //#endregion

        //#region Counteragents

        const getCounteragentsResult = await getCounteragents();
        const counterAgents: Array<{ value: string; label: string; }> | undefined = 
          getCounteragentsResult
            ? getCounteragentsResult.map((counteragent) => {
                return {
                  value: counteragent.id.toString(),
                  label: counteragent.name,
                };
              })
            : [];
        setAllCounteragents(counterAgents);

        //#endregion Counteragents


        //#region Selections

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
        setAllSelections(getSelectionsResult);

        //#endregion Selections

        //#region Sports

        const getSportsResult = await getSports();
        const sports: Array<{ value: string; label: string; }> | undefined =
        getSportsResult
            ? getSportsResult.map((sport) => {
                return {
                  value: sport,
                  label: sport,
                };
              })
            : [];
        setAllSports(sports);

        //#endregion Sports
              
        //#region Tournaments

        const getTournamentsResult = await getTournaments();
        const tournaments: Array<{ value: string; label: string; }> | undefined =
        getTournamentsResult
            ? getTournamentsResult.map((tournament) => {
                return {
                  value: tournament,
                  label: tournament,
                };
              })
            : [];
        setAllTournaments(tournaments);

        //#endregion Tournaments

        //#region Markets

        const getMarketsResult = await getMarkets();
        const markets: Array<{ value: string; label: string; }> | undefined =
          getMarketsResult
              ? getMarketsResult.map((market) => {
                  return {
                    value: market,
                    label: market,
                  };
                })
              : [];
        setAllMarkets(markets);

        //#endregion Markets

        //#region Currencies

        let currencies: Array<Currency> | undefined = await getCurrencies();
        setAllCurrencies(currencies);

        //#endregion


        //#region Filters

        

        setDateFrom(dateFrom);
        setDateTo(new Date());

        //#endregion Filters
      
        setIsLoading(false);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    setFilteredRows((previousRowsModel: Array<BetModel> | undefined) => {
      if(rows) {
        const bets: Array<BetModel> = [];
        for(var i = 0; i <= rows?.length - 1; i++) {
          const currentRow = rows[i];
          if(counteragentIds) {
            const matchCounteragents = !!currentRow.counteragentId && counteragentIds?.indexOf(currentRow.counteragentId) !== -1;

            if(!matchCounteragents) {
              continue;
            }
          }
          if(currentRow.dateFinished) {
            if(dateFrom && dateTo) {
              if(currentRow.dateFinished?.getTime() > dateFrom.getTime() 
                && currentRow.dateFinished?.getTime() < dateTo.getTime()) {
                  bets.push(currentRow);
              }
            } else if(dateFrom && !dateTo) {
              if(currentRow.dateFinished?.getTime() > dateFrom.getTime()) {
                  bets.push(currentRow);
              }
            } else if(!dateFrom && dateTo) {
              if(currentRow.dateFinished?.getTime() < dateTo.getTime()) {
                  bets.push(currentRow);
              }
            } else {
              bets.push(currentRow); 
            }
          }
        }

        return bets;
      } else {
        return [];
      }
    });

    // setFilteredExpensesRows((previousRowsModel: Array<ExpenseModel> | undefined) => {
    //   if(expensesRows) {
    //     const expenses: Array<ExpenseModel> = [];
    //     for(var i = 0; i <= expensesRows.length - 1; i++) {
    //       const currentRow = expensesRows[i];
    //       if(counteragentId && counteragentId !== currentRow.counteragentId) {
    //         continue;
    //       }

    //       if(dateFrom && dateTo) {
    //         if(currentRow.dateCreated.getTime() > dateFrom.getTime() 
    //           && currentRow.dateCreated.getTime() < dateTo.getTime()) {
    //             expenses.push(currentRow);
    //         }
    //       } else if(dateFrom && !dateTo) {
    //         if(currentRow.dateCreated.getTime() > dateFrom.getTime()) {
    //             expenses.push(currentRow);
    //         }
    //       } else if(!dateFrom && dateTo) {
    //         if(currentRow.dateCreated.getTime() < dateTo.getTime()) {
    //           expenses.push(currentRow);
    //         }
    //       } else {
    //         expenses.push(currentRow); 
    //       }
    //     }

    //     return expenses;
    //   } else {
    //     return [];
    //   }
    // });
  }, [ dateFrom, dateTo, stakeFrom, stakeTo, oddFrom, oddTo, psLimitFrom, psLimitTo, 
    counteragentCategoriesIds, counteragentIds, sportIds, marketIds, tournamentIds, liveStatusIds,]);


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

  const selectBetId = async (id: number) => {
    setSelectedBetId(id);
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

  const distinctCounteragents: Array<{ value: number; label: string; }> = rows
    ? rows.filter((value: BetModel, index: number, array: Array<BetModel>) => {
        if(!value.counteragentId || !value.counteragent) {
          return false;
        }

        return array
          .map((betModel: BetModel) => betModel.counteragentId)
          .indexOf(value.counteragentId) === index;
      }).map((betModel) => {
        return {
          value: betModel.counteragentId!,
          label: betModel.counteragent!,
        }
      })
    : [];

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
      <Typography variant='h4'>Statistics</Typography>
      {
        currentStatistcs
          ? (
              <DataGridPro
                columns={statisticsColumns}
                rows={currentStatistcs}
              />
            )
          : null
      }
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker label="From" value={dayjs(dateFrom)} onChange={(newValue) => {
          setDateFrom(newValue ? new Date(newValue?.toISOString()) : undefined);
        }} />
        <DatePicker label="To" value={dayjs(dateTo)} onChange={(newValue) => {
          setDateTo(newValue ? new Date(newValue?.toISOString()) : undefined);
        }}/>
      </LocalizationProvider>
      <Autocomplete
        multiple
        id="checkboxes-tags-demo"
        options={distinctCounteragents}
        disableCloseOnSelect
        getOptionLabel={(option) => option.label}
        renderOption={(props, option) => {
          let isSelected = false;

          if(counteragentIds) {
            isSelected = counteragentIds.some((c) => c === option.value);
          }
          
          return (
            <li {...props}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8 }}
                checked={isSelected}
              />
              {option.label}
            </li>
          )
        }}
        style={{ width: 500 }}
        renderInput={(params) => {
          return (
            <TextField {...params} label="Counteragent" placeholder="Counteragent" />
          );
        }}
        onChange={(e: any, values: Array<{ value: number; label: string; }>) => {
          const finalValues: Array<{ value: number; label: string; }> = [];

          for(var i = 0; i <= values.length - 1; i++) {
            const shouldRemove = 
              values.filter((v) => v.value === values[i].value).length % 2 === 0;
            if(!shouldRemove) {
              finalValues.push(values[i]);
            }
          }

          const ids: Array<number> = finalValues.map((v) => v.value);
          
          const uniqueIds = ids.filter((elem, pos) => {
            return ids.indexOf(elem) == pos;
          });

          console.log(JSON.stringify(uniqueIds));
          setCounteragentIds((previousModel: Array<number> | undefined) => {
            return uniqueIds;
          });
        }}
        value={[ 
          { value: 1, label: 'Counteragent 1', }, 
          { value: 2, label: 'Counteragent 2', },
          { value: 3, label: 'Counteragent 3', },
          { value: 4, label: 'Counteragent 4', },
          { value: 5, label: 'Counteragent 5', },
        ].filter((v) => counteragentIds?.some((c) => c === v.value))}
      />
      <Typography variant='h4'>Bets</Typography>
      {
        filteredRows
          ? (
              <Bets
                isRead={true} 
                selectBetIdFn={selectBetId}
                setIsLoading={setIsLoading} 
                defaultRows={filteredRows}
                possibleCounteragents={allCounteragents}
                possibleSports={allSports}
                possibleTournaments={allTournaments}
                possibleMarkets={allMarkets}
                allSelections={allSelections ? allSelections : {}}
                currencies={allCurrencies}
              />
            )
          : null
      }
      <Typography variant='h4'>Expenses</Typography>
      {
        filteredExpensesRows
          ? (
              <Expenses 
                isRead={true}
                setIsLoading={setIsLoading}
                defaultRows={filteredExpensesRows}
                possibleCounteragents={allCounteragents}
              />
            )
          : null
      }
    </Paper>
  );
}
