import React, { useEffect } from 'react';
import { Autocomplete, Checkbox, CircularProgress, FormControl, FormControlLabel, 
  Paper, Radio, RadioGroup, TextField, Typography} from '@mui/material';
  import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import dayjs from 'dayjs';
import './Search.css';
import Bets from '../../components/Bets/Bets';
import { BetModel, ExpenseModel, ISelectionsResult, StatisticItemModel } from '../../models';
import { getBetStatistics, getCounteragents, getCurrencies, getExpenses, getMarkets, 
  getPendingBets, getSports, getTournaments } from '../../api';
import { Bet, Currency, Expense, Statistics } from '../../database-models';
import { LiveStatus, StatisticType } from '../../models/enums';
import Expenses from '../../components/Expenses/Expenses';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

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

const AutocompleteComponent = (props: { 
  id: string;
  label: string;
  options: Array<{ value: string; label: string; }>;
  selectedOptions: Array<string>;
  setStateFn: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const { id, label, options, selectedOptions, setStateFn, } = props;
  return (
    <Autocomplete
      className='search-filters-autocomplete'
      multiple
      id={id}
      options={options}
      disableCloseOnSelect
      getOptionLabel={(option) => option.label}
      renderOption={(props, option) => {
        let isSelected = false;

        if(selectedOptions) {
          isSelected = selectedOptions.some((c) => c === option.value);
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
          <TextField {...params} label={label} placeholder={label} />
        );
      }}
      onChange={(e: any, values: Array<{ value: string; label: string; }>) => {
        const finalValues: Array<{ value: string; label: string; }> = [];

        for(var i = 0; i <= values.length - 1; i++) {
          const shouldRemove = 
            values.filter((v) => v.value === values[i].value).length % 2 === 0;
          if(!shouldRemove) {
            finalValues.push(values[i]);
          }
        }

        const ids: Array<string> = finalValues.map((v) => v.value);
        
        const uniqueIds = ids.filter((elem, pos) => {
          return ids.indexOf(elem) == pos;
        });

        setStateFn((previousModel: Array<string>) => {
          return uniqueIds;
        });
      }}
      value={options
        .filter((v) => selectedOptions.some((c) => c === v.value))}
    />
  );
}

export default function Search() {
  const [ isLoading, setIsLoading, ] = React.useState<boolean>(false);
  
  const [ selectedBetId, setSelectedBetId, ] = React.useState<number | undefined>(undefined);
  const [ areExpensesShown, setAreExpensesShown, ] = React.useState<boolean>(false);
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

  const [ counteragentCategoriesIds, setCounteragentCategoriesIds ] = React.useState<Array<string>>([]);
  const [ counteragentIds, setCounteragentIds ] = React.useState<Array<string>>([]);
  const [ sportIds, setSportIds ] = React.useState<Array<string>>([]);
  const [ marketIds, setMarketIds ] = React.useState<Array<string>>([]);
  const [ tournamentIds, setTournamentIds ] = React.useState<Array<string>>([]);
  const [ liveStatusIds, setLiveStatusIds ] = React.useState<Array<string>>([]);

  //#endregion Filters

  const [ rows, setRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [ filteredRows, setFilteredRows] = React.useState<Array<BetModel> | undefined>(undefined);

  const [ expenseRows, setExpenseRows] = React.useState<Array<ExpenseModel> | undefined>(undefined);
  const [ filteredExpenseRowsRows, setFilteredExpenseRows] = React.useState<Array<ExpenseModel> | undefined>(undefined);

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

        //#region Filters

        const dateFrom: Date = new Date();
        dateFrom.setMonth(dateFrom.getMonth() - 1);
        const now = new Date();

        setDateFrom(dateFrom);
        setDateTo(new Date());

        //#endregion Filters

        //#region Bets

        let bets: Array<BetModel> = (await getPendingBets())!.map(betToBetModelMapper);
        setRows(bets);
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

        let expenses: Array<ExpenseModel> = (await getExpenses())!.map((expense: Expense) => {
          return {
            id: expense.id,
            amount: expense.amount,
            dateCreated: new Date(expense.dateCreated),
            description: expense.description,
            counteragentId: expense.counteragentId,
            counteragent: expense.counteragent
              ? expense.counteragent.name
              : undefined,
            
            actionTypeApplied: undefined,
            isSavedInDatabase: true,
          };
        });

        setExpenseRows(expenses);
        setFilteredExpenseRows(expenses.filter((expense) => {
          if(expense.dateCreated) {
            return expense.dateCreated.getTime() > dateFrom.getTime()
              && expense.dateCreated.getTime() < now.getTime();
          } else {
            return false;
          }
        }));

        //#endregion Expenses

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

          //#region Counteragent category filter

          // if(counteragentCategoriesIds.length > 0) {
          //   const matchCounteragentCategoriess = !!currentRow.counteragent 
          //     && currentRow.counteragent.counteragent
          //     counteragentCategoriesIds.indexOf(currentRow.counteragentId.toString()) !== -1;

          //   if(!matchCounteragents) {
          //     continue;
          //   }
          // }

          //#endregion Counteragent category filter

          //#region Counteragent filter

          if(counteragentIds.length > 0) {
            const matchCounteragents = !!currentRow.counteragentId && 
            counteragentIds.indexOf(currentRow.counteragentId.toString()) !== -1;

            if(!matchCounteragents) {
              continue;
            }
          }

          //#endregion Counteragent filter

          //#region Sport filter

          if(sportIds.length > 0) {
            const matchSports = !!currentRow.sport && 
            sportIds.indexOf(currentRow.sport) !== -1;

            if(!matchSports) {
              continue;
            }
          }

          //#endregion Sport filter

          //#region Market filter

          if(marketIds.length > 0) {
            const matchMarkets = !!currentRow.market && 
              marketIds.indexOf(currentRow.market) !== -1;

            if(!matchMarkets) {
              continue;
            }
          }

          //#endregion Market filter

          //#region Tournament filter

          if(tournamentIds.length > 0) {
            const matchTournaments = !!currentRow.tournament && 
              tournamentIds.indexOf(currentRow.tournament) !== -1;

            if(!matchTournaments) {
              continue;
            }
          }

          //#endregion Tournament filter

          //#region Live status filter

          if(liveStatusIds.length > 0) {
            const matchLiveStatuses = !!currentRow.liveStatus && 
              liveStatusIds.indexOf(currentRow.liveStatus.toString()) !== -1;

            if(!matchLiveStatuses) {
              continue;
            }
          }

          //#endregion Live status filter


          //#region DateFrom - DateTo filter

          let matchDateFinished = false;
          if(currentRow.dateFinished) {
            if(dateFrom && dateTo) {
              if(currentRow.dateFinished?.getTime() > dateFrom.getTime() 
                && currentRow.dateFinished?.getTime() < dateTo.getTime()) {
                matchDateFinished = true;
              }
            } else if(dateFrom && !dateTo) {
              if(currentRow.dateFinished?.getTime() > dateFrom.getTime()) {
                matchDateFinished = true;
              }
            } else if(!dateFrom && dateTo) {
              if(currentRow.dateFinished?.getTime() < dateTo.getTime()) {
                matchDateFinished = true;
              }
            } else {
                matchDateFinished = true;
            }
          }

          if(!matchDateFinished) {
            continue;
          }

          //#endregion DateFrom - DateTo filter

          //#region StakeFrom - StakeTo filter

          let matchStake = true;
          if(typeof currentRow.stake !== 'undefined') {
            if(typeof stakeFrom !== 'undefined' && typeof stakeTo !== 'undefined'
                && (currentRow.stake < stakeFrom || currentRow.stake > stakeTo)) {
              matchStake = false;
            } else if(typeof stakeFrom !== 'undefined' && typeof stakeTo === 'undefined' 
              && currentRow.stake < stakeFrom) {
              matchStake = false;
            } else if(typeof stakeFrom === 'undefined' && typeof stakeTo !== 'undefined' 
              && currentRow.stake > stakeTo) {
              matchStake = false;
            }
          }

          if(!matchStake) {
            continue;
          }

          //#endregion StakeFrom - StakeTo filter

          //#region OddFrom - OddTo filter

          let matchOdd = true;
          if(typeof currentRow.odd !== 'undefined') {
            if(typeof oddFrom !== 'undefined' && typeof oddTo !== 'undefined'
                && (currentRow.odd < oddFrom || currentRow.odd > oddTo)) {
                  matchOdd = false;
            } else if(typeof oddFrom !== 'undefined' && typeof oddTo === 'undefined' 
              && currentRow.odd < oddFrom) {
              matchOdd = false;
            } else if(typeof oddFrom === 'undefined' && typeof oddTo !== 'undefined' 
              && currentRow.odd > oddTo) {
              matchOdd = false;
            }
          }

          if(!matchOdd) {
            continue;
          }

          //#endregion OddFrom - OddTo filter

          //#region PsLimitFrom - PsLimitTo filter

          let matchPsLimit = true;
          if(typeof currentRow.psLimit !== 'undefined') {
            if(typeof psLimitFrom !== 'undefined' && typeof psLimitTo !== 'undefined'
                && (currentRow.psLimit < psLimitFrom || currentRow.psLimit > psLimitTo)) {
                  matchPsLimit = false;
            } else if(typeof psLimitFrom !== 'undefined' && typeof psLimitTo === 'undefined' 
              && currentRow.psLimit < psLimitFrom) {
              matchPsLimit = false;
            } else if(typeof psLimitFrom === 'undefined' && typeof psLimitTo !== 'undefined' 
              && currentRow.psLimit > psLimitTo) {
              matchPsLimit = false;
            }
          }

          if(!matchPsLimit) {
            continue;
          }

          //#endregion PsLimitFrom - PsLimitTo filter

          bets.push(currentRow);
        }

        return bets;
      } else {
        return [];
      }
    });
  }, [ dateFrom, dateTo, stakeFrom, stakeTo, oddFrom, oddTo, psLimitFrom, psLimitTo, 
    counteragentCategoriesIds, counteragentIds, sportIds, marketIds, tournamentIds, liveStatusIds,]);

  useEffect(() => {
    setFilteredExpenseRows((previousRowsModel: Array<ExpenseModel> | undefined) => {
      if(expenseRows) {
        const expenses: Array<ExpenseModel> = [];
        for(var i = 0; i <= expenseRows.length - 1; i++) {
          const currentRow = expenseRows[i];

          //#region Counteragent filter

          if(counteragentIds.length > 0) {
            const matchCounteragents = !!currentRow.counteragentId && 
              counteragentIds.indexOf(currentRow.counteragentId.toString()) !== -1;

            if(!matchCounteragents) {
              continue;
            }
          }

          //#endregion Counteragent filter

          //#region DateFrom - DateTo filter

          let matchDateCreated = false;
          if(currentRow.dateCreated) {
            if(dateFrom && dateTo) {
              if(currentRow.dateCreated.getTime() > dateFrom.getTime() 
                && currentRow.dateCreated.getTime() < dateTo.getTime()) {
                  matchDateCreated = true;
              }
            } else if(dateFrom && !dateTo) {
              if(currentRow.dateCreated.getTime() > dateFrom.getTime()) {
                matchDateCreated = true;
              }
            } else if(!dateFrom && dateTo) {
              if(currentRow.dateCreated.getTime() < dateTo.getTime()) {
                matchDateCreated = true;
              }
            } else {
              matchDateCreated = true;
            }
          }

          if(!matchDateCreated) {
            continue;
          }

          //#endregion DateFrom - DateTo filter

          expenses.push(currentRow);
        }

        return expenses;
      } else {
        return [];
      }
    });
  }, [ dateFrom, dateTo, counteragentIds,]);
  
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

  const distinctCounteragents: Array<{ value: string; label: string; }> = filteredRows
    ? filteredRows.filter((value: BetModel, index: number, array: Array<BetModel>) => {
        if(!value.counteragentId || !value.counteragent) {
          return false;
        }

        return array
          .map((betModel: BetModel) => betModel.counteragentId)
          .indexOf(value.counteragentId) === index;
      }).map((betModel) => {
        return {
          value: betModel.counteragentId!.toString(),
          label: betModel.counteragent!,
        }
      })
    : [];

  const distinctSports: Array<{ value: string; label: string; }> = filteredRows
    ? filteredRows.filter((value: BetModel, index: number, array: Array<BetModel>) => {
        if(!value.sport) {
          return false;
        }

        return array
          .map((betModel: BetModel) => betModel.sport)
          .indexOf(value.sport) === index;
      }).map((betModel) => {
        return {
          value: betModel.sport!,
          label: betModel.sport!,
        }
      })
    : [];

  const distinctMarkets: Array<{ value: string; label: string; }> = filteredRows
    ? filteredRows.filter((value: BetModel, index: number, array: Array<BetModel>) => {
        if(!value.market) {
          return false;
        }

        return array
          .map((betModel: BetModel) => betModel.market)
          .indexOf(value.market) === index;
      }).map((betModel) => {
        return {
          value: betModel.market!,
          label: betModel.market!,
        }
      })
    : [];

  const distinctTournaments: Array<{ value: string; label: string; }> = filteredRows
    ? filteredRows.filter((value: BetModel, index: number, array: Array<BetModel>) => {
        if(!value.tournament) {
          return false;
        }

        return array
          .map((betModel: BetModel) => betModel.tournament)
          .indexOf(value.tournament) === index;
      }).map((betModel) => {
        return {
          value: betModel.tournament!,
          label: betModel.tournament!,
        }
      })
    : [];

  const distinctLiveStatuses: Array<{ value: string; label: string; }> = filteredRows
    ? filteredRows.filter((value: BetModel, index: number, array: Array<BetModel>) => {
        return array
          .map((betModel: BetModel) => betModel.liveStatus)
          .indexOf(value.liveStatus) === index;
      }).map((betModel) => {
        return {
          value: betModel.liveStatus.toString(),
          label: LiveStatus[betModel.liveStatus],
        }
      })
    : [];

  return (
    <Paper sx={{ padding: '5%', }}>
      <Typography variant='h1' className='typography'>
        Search
      </Typography>
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
      <FormControl component="fieldset">
        <FormControlLabel
          value="end"
          control={<Checkbox />}
          label="Are expenses shown"
          labelPlacement="end"
          onChange={(e, checked) => {
            setAreExpensesShown(checked);
          }}
        />
      </FormControl>
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
      <Paper className='margin-top-5'> 
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker label="From" value={dayjs(dateFrom)} onChange={(newValue) => {
              setDateFrom(newValue ? new Date(newValue?.toISOString()) : undefined);
            }} />
            <DatePicker label="To" value={dayjs(dateTo)} onChange={(newValue) => {
              setDateTo(newValue ? new Date(newValue?.toISOString()) : undefined);
            }}/>
        </LocalizationProvider>
        <Paper className='margin-top-1'>
          <TextField id="stake-from" label="Stake from" variant="outlined" type="number" onChange={(e) => {
              const stakeFrom = parseInt(e.target.value);
              if(!isNaN(stakeFrom)) {
                setStakeFrom(stakeFrom);
              } else {
                setStakeFrom(undefined);
              }
          }} />
          <TextField id="stake-to" label="Stake to" variant="outlined" type="number" onChange={(e) => {
              const stakeTo = parseInt(e.target.value);
              if(!isNaN(stakeTo)) {
                setStakeTo(stakeTo);
              } else {
                setStakeTo(undefined);
              }
          }} />
        </Paper>
        <Paper className='margin-top-1'>
          <TextField id="odd-from" label="Odd from" variant="outlined" type="number" onChange={(e) => {
              const oddFrom = parseInt(e.target.value);
              if(!isNaN(oddFrom)) {
                setOddFrom(oddFrom);
              } else {
                setOddFrom(undefined);
              }
          }} />
          <TextField id="odd-to" label="Odd to" variant="outlined" type="number" onChange={(e) => {
              const oddTo = parseInt(e.target.value);
              if(!isNaN(oddTo)) {
                setOddTo(oddTo);
              } else {
                setOddTo(undefined);
              }
          }} />
        </Paper>
        <Paper className='margin-top-1'>
          <TextField id="psLimit-from" label="PsLimit from" variant="outlined" type="number" onChange={(e) => {
              const psLimitFrom = parseInt(e.target.value);
              if(!isNaN(psLimitFrom)) {
                setPsLimitFrom(psLimitFrom);
              } else {
                setPsLimitFrom(undefined);
              }
          }} />
          <TextField id="psLimit-to" label="PsLimit to" variant="outlined" type="number" onChange={(e) => {
              const psLimitTo = parseInt(e.target.value);
              if(!isNaN(psLimitTo)) {
                setPsLimitTo(psLimitTo);
              } else {
                setPsLimitTo(undefined);
              }
          }} />
        </Paper>
        <Paper className='search-filters-container'>
          <AutocompleteComponent 
            id='counteragents-autocomplete'
            label='Counteragent'
            options={distinctCounteragents} 
            selectedOptions={counteragentIds}
            setStateFn={setCounteragentIds}/>
          <AutocompleteComponent 
            id='sports-autocomplete'
            label='Sport'
            options={distinctSports} 
            selectedOptions={sportIds}
            setStateFn={setSportIds}/>
          <AutocompleteComponent 
            id='markets-autocomplete'
            label='Market'
            options={distinctMarkets} 
            selectedOptions={marketIds}
            setStateFn={setMarketIds}/>
          <AutocompleteComponent 
            id='tournaments-autocomplete'
            label='Tournament'
            options={distinctTournaments} 
            selectedOptions={tournamentIds}
            setStateFn={setTournamentIds}/>
          <AutocompleteComponent 
            id='liveStatuses-autocomplete'
            label='LiveStatus'
            options={distinctLiveStatuses} 
            selectedOptions={liveStatusIds}
            setStateFn={setLiveStatusIds}/>
        </Paper>
      </Paper>
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
        filteredExpenseRowsRows && allCounteragents && allCounteragents.length > 0
          && areExpensesShown
          ? (
              <Expenses 
                isRead={false}
                setIsLoading={setIsLoading}
                defaultRows={filteredExpenseRowsRows}
                possibleCounteragents={allCounteragents}
              />
            )
          : null
      }
    </Paper>
  );
}
