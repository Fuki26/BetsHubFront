import React, { useEffect } from 'react';
import { Autocomplete, Checkbox, CircularProgress, FormControl, FormControlLabel, 
  Paper, Radio, RadioGroup, TextField, Typography} from '@mui/material';
  import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import dayjs from 'dayjs';
import './Search.css';
import Bets from '../../components/Bets/Bets';
import { BetModel, ExpenseModel, IDropdownValue, ISelectionsResult, StatisticItemModel } from '../../models';
import { getBetStatistics, getCounterAgents, 
  getCurrencies, getExpenses, getMarkets, 
  getPendingBets, getSports, getTournaments } from '../../api';
import { Currency, Expense, Statistics } from '../../database-models';
import { StatisticType } from '../../models/enums';
import Expenses from '../../components/Expenses/Expenses';
import { betToBetModelMapper } from '../../utils';

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

const AutocompleteComponent = (props: { 
  id: string;
  label: string;
  options: Array<IDropdownValue>;
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
          isSelected = selectedOptions.some((c) => c === option.id);
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
      onChange={(e: any, values: Array<IDropdownValue>) => {
        const finalValues: Array<IDropdownValue> = [];

        for(var i = 0; i <= values.length - 1; i++) {
          const shouldRemove = 
            // eslint-disable-next-line no-loop-func
            values.filter((v) => v.id === values[i].id).length % 2 === 0;
          if(!shouldRemove) {
            finalValues.push(values[i]);
          }
        }

        const ids: Array<string> = finalValues.map((v) => v.id);
        
        const uniqueIds = ids.filter((elem, pos) => {
          return ids.indexOf(elem) === pos;
        });

        setStateFn((previousModel: Array<string>) => {
          return uniqueIds;
        });
      }}
      value={options
        .filter((v) => selectedOptions.some((c) => c === v.id))}
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
  const [ currencyIds, setCurrencyIds ] = React.useState<Array<string>>([]);

  //#endregion Filters

  const [ rows, setRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [ filteredRows, setFilteredRows] = React.useState<Array<BetModel> | undefined>(undefined);

  const [ expenseRows, setExpenseRows] = React.useState<Array<ExpenseModel> | undefined>(undefined);
  const [ filteredExpenseRowsRows, setFilteredExpenseRows] = React.useState<Array<ExpenseModel> | undefined>(undefined);

  const [ allCounterAgents, setAllCounterAgents ] = 
    React.useState<Array<IDropdownValue> | undefined>(undefined);
  const [ allSports, setAllSports ] = 
  React.useState<Array<IDropdownValue> | undefined>(undefined);
  const [ allTournaments, setAllTournaments ] = 
    React.useState<Array<IDropdownValue> | undefined>(undefined);
  const [ allMarkets, setAllMarkets ] = 
    React.useState<Array<IDropdownValue> | undefined>(undefined);
  const [ allSelections, setAllSelections ] = 
    React.useState<ISelectionsResult | undefined>(undefined);
  const [ allCurrencies, setAllCurrencies ] = 
    React.useState<Array<Currency> | undefined>(undefined);


  const [ databaseCurrencies, setDatabaseCurrencies ] = 
    React.useState<Array<Currency> | undefined>(undefined);
  

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
        const filteredRows: Array<BetModel> = bets.filter((b) => {
          if(b.dateFinished) {
            return b.dateFinished.getTime() > dateFrom.getTime()
              && b.dateFinished.getTime() < now.getTime();
          } else {
            return false;
          }
        });
        setFilteredRows(filteredRows);

        //#endregion Bets

        //#region Expenses

        let expenses: Array<ExpenseModel> = (await getExpenses())!
          .map((expense: Expense): ExpenseModel => {
            return {
              id: expense.id,
              amount: expense.amount,
              dateCreated: new Date(expense.dateCreated),
              description: expense.description,
              counterAgent: expense.counteragent
                ? {
                    id: expense.counteragent.id.toString(),
                    label: expense.counteragent.name,
                  }
                : undefined,
              counterAgentCategory: expense.counteragent && expense.counteragent.counteragentCategory
                  ? { 
                      id: expense.counteragent.counteragentCategory.id.toString(), 
                      label: expense.counteragent.counteragentCategory.name! 
                    }
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

        const getCounterAgentsResult = await getCounterAgents();
        const counterAgents: Array<IDropdownValue> = 
          getCounterAgentsResult
            ? getCounterAgentsResult.map((couterAgent) => {
                return {
                  id: couterAgent.id.toString(),
                  label: couterAgent.name,
                };
              })
            : [];
        setAllCounterAgents(counterAgents);

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
        const sports: Array<IDropdownValue> =
          getSportsResult
            ? getSportsResult.map((sport) => {
                return {
                  id: sport,
                  label: sport,
                };
              })
            : [];
        setAllSports(sports);

        //#endregion Sports
              
        //#region Tournaments

        const getTournamentsResult = await getTournaments();
        const tournaments: Array<IDropdownValue> =
        getTournamentsResult
            ? getTournamentsResult.map((tournament) => {
                return {
                  id: tournament,
                  label: tournament,
                };
              })
            : [];
        setAllTournaments(tournaments);

        //#endregion Tournaments

        //#region Markets

        const getMarketsResult = await getMarkets();
        const markets: Array<IDropdownValue> =
          getMarketsResult
              ? getMarketsResult.map((market) => {
                  return {
                    id: market,
                    label: market,
                  };
                })
              : [];
        setAllMarkets(markets);

        //#endregion Markets

        //#region Currencies

        let getCurrenciesResult: Array<Currency> | undefined = await getCurrencies();
        setDatabaseCurrencies(getCurrenciesResult);
        setAllCurrencies(getCurrenciesResult);

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

          if(counteragentCategoriesIds.length > 0) {
            const matchCounteragentCategories = !!currentRow.counterAgentCategory && 
              counteragentCategoriesIds.indexOf(currentRow.counterAgentCategory.id) !== -1;

            if(!matchCounteragentCategories) {
              continue;
            }
          }

          //#endregion Counteragent category filter

          //#region Counteragent filter

          if(counteragentIds.length > 0) {
            const matchCounteragents = !!currentRow.counterAgent && 
              counteragentIds.indexOf(currentRow.counterAgent.id) !== -1;

            if(!matchCounteragents) {
              continue;
            }
          }

          //#endregion Counteragent filter

          //#region Sport filter

          if(sportIds.length > 0) {
            const matchSports = !!currentRow.sport && 
              sportIds.indexOf(currentRow.sport.id) !== -1;

            if(!matchSports) {
              continue;
            }
          }

          //#endregion Sport filter

          //#region Market filter

          if(marketIds.length > 0) {
            const matchMarkets = !!currentRow.market && 
              marketIds.indexOf(currentRow.market.id) !== -1;

            if(!matchMarkets) {
              continue;
            }
          }

          //#endregion Market filter

          //#region Tournament filter

          if(tournamentIds.length > 0) {
            const matchTournaments = !!currentRow.tournament && 
              tournamentIds.indexOf(currentRow.tournament.id) !== -1;

            if(!matchTournaments) {
              continue;
            }
          }

          //#endregion Tournament filter

          //#region Live status filter

          if(liveStatusIds.length > 0) {
            const matchLiveStatuses = !!currentRow.liveStatus && 
              liveStatusIds.indexOf(currentRow.liveStatus.id) !== -1;

            if(!matchLiveStatuses) {
              continue;
            }
          }

          //#endregion Live status filter

          //#region Currency filter

          if(currencyIds.length > 0) {
            if(!currentRow.amounts || currentRow.amounts.length === 0) {
              continue;
            }

            const matchCurrencies = (currentRow.amounts as any)
              .some((a: any) => {
                return currencyIds.indexOf(a.currencyId.toString()) !== -1
                  && a.amount > 0;
              });

            if(!matchCurrencies) {
              continue;
            }
          }

          //#endregion Currency filter


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

        if(databaseCurrencies && currencyIds.length > 0) {
          const filteredCurrencies: Array<Currency> 
            = databaseCurrencies.filter((c) => currencyIds.indexOf(c.id.toString()) !== -1);

          setAllCurrencies(filteredCurrencies);

          for(var i = 0; i <= bets.length - 1; i++) {
            const currentBet = bets[i];
            if(!currentBet.amounts) {
              continue;
            }

            let totalAmount = 0;
            for(var j = 0; j <= currentBet.amounts.length - 1; j++) {
              const currentAmount: any = currentBet.amounts[j];
              if(currencyIds.indexOf(currentAmount.currencyId.toString()) === -1) {
                continue;
              }
              
              const databaseCurrency = databaseCurrencies.find((dC) => dC.id === currentAmount.currencyId)
              totalAmount += currentAmount.amount * databaseCurrency!.conversionRateToBGN;
            }

            currentBet.totalAmount = totalAmount;
          }
        } else {
          setAllCurrencies(databaseCurrencies);
        }
        
        return bets;
      } else {
        return [];
      }
    });
  }, [ dateFrom, dateTo, stakeFrom, stakeTo, oddFrom, oddTo, psLimitFrom, psLimitTo, 
    counteragentCategoriesIds, counteragentIds, sportIds, marketIds, tournamentIds, liveStatusIds, currencyIds, 
      rows]);

  useEffect(() => {
    setFilteredExpenseRows((previousRowsModel: Array<ExpenseModel> | undefined) => {
      if(expenseRows) {
        const expenses: Array<ExpenseModel> = [];
        for(var i = 0; i <= expenseRows.length - 1; i++) {
          const currentRow = expenseRows[i];

          //#region Counteragent Category filter

          if(counteragentCategoriesIds.length > 0) {
            const matchCounteragentCategories = !!currentRow.counterAgentCategory && 
              counteragentCategoriesIds.indexOf(currentRow.counterAgentCategory.id) !== -1;

            if(!matchCounteragentCategories) {
              continue;
            }
          }

          //#endregion Counteragent Category filter

          //#region Counteragent filter

          if(counteragentIds.length > 0) {
            const matchCounteragents = !!currentRow.counterAgent && 
              counteragentIds.indexOf(currentRow.counterAgent.id) !== -1;

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
  }, [ dateFrom, dateTo, counteragentCategoriesIds, counteragentIds, expenseRows]);
  
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

  const distinctCounteragentCategories: Array<IDropdownValue> = 
    (
        filteredRows
          ? [
              ...new Set(
                filteredRows
                  .filter((b: BetModel) => !!b.counterAgentCategory)
                  .map((b) => b.counterAgentCategory!.id)
              )
            ]
          : []
    ).map((counterAgentCategoryId: string) => { 
            const model = 
              filteredRows!.find((r) => r.counterAgentCategory
                && r.counterAgentCategory.id === counterAgentCategoryId)

            return { 
              id: model?.counterAgentCategory?.id, 
              label: model?.counterAgentCategory?.label,
            } as IDropdownValue; 
          });

  const distinctCounteragents: Array<IDropdownValue> = (filteredRows
    ? [
        ...new Set(
          filteredRows
            .filter((b: BetModel) => !!b.counterAgent)
            .map((b) => b.counterAgent!.id)
        )
      ]
    : []).map((counterAgentId: string) => { 
            const model = 
              filteredRows!.find((r) => r.counterAgent && r.counterAgent.id === counterAgentId)

            return { 
              id: model?.counterAgent?.id, 
              label: model?.counterAgent?.label,
            } as IDropdownValue; 
          });

  const distinctSports: Array<IDropdownValue> = (filteredRows
    ? [
        ...new Set(
          filteredRows
            .filter((b: BetModel) => !!b.sport)
            .map((b: BetModel) => b.sport!.id)
        )
      ]
    : [])
  .map((b) => { return { id: b, label: b } as IDropdownValue; } );

  const distinctMarkets: Array<IDropdownValue> = (filteredRows
    ? [
        ...new Set(
          filteredRows
            .filter((b: BetModel) => !!b.market)
            .map((b: BetModel) => b.market!.id)
        )
      ]
    : [])
  .map((b) => { return { id: b, label: b } as IDropdownValue; } );

  const distinctTournaments: Array<IDropdownValue> = (filteredRows
    ? [
        ...new Set(
          filteredRows
            .filter((b: BetModel) => !!b.tournament)
            .map((b: BetModel) => b.tournament!.id)
        )
      ]
    : [])
  .map((b) => { return { id: b, label: b } as IDropdownValue; } );

  const distinctLiveStatuses: Array<IDropdownValue> = (filteredRows
    ? [
        ...new Set(
          filteredRows
            .filter((b: BetModel) => !!b.liveStatus)
            .map((b) => b.liveStatus!.id)
        )
      ]
    : []).map((liveStatusId) => { 
            const model = 
              filteredRows!.find((r) => r.liveStatus && r.liveStatus.id === liveStatusId)

            return { 
              id: model?.liveStatus?.id, 
              label: model?.liveStatus?.label,
            } as IDropdownValue; 
          });

  const distinctCurrencies: Array<IDropdownValue> = databaseCurrencies
        ? databaseCurrencies.map((currency) => {
            return {
              id: currency.id.toString(),
              label: currency.abbreviation,
            };
          })
        : [];


  
  let totalOfTotals = 0;
  if(rows) {
    totalOfTotals = rows.reduce(
      (accumulator, currentValue: BetModel) => {
        if(currentValue.totalAmount) {
          return accumulator + currentValue.totalAmount;
        } else {
          return accumulator;
        }
      },
      0
    );
  }
  

  return (
    <>
     {
      isLoading
        ? (
            <>
            <div className='background-color-blur'>
            <CircularProgress color="success" 
                size={250}
                disableShrink={true}
                style={{
                  position: 'fixed', 
                  top: '40%', 
                  right: '40%', 
                  zIndex: 9999999999999,
                  transition: 'none',
                }}

              />
            </div>
             
            </>
            
          )
        : null
    }
    <Paper sx={{ padding: '5%', }}>
      <Typography variant='h1' className='typography'>
        Search
      </Typography>
    
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
                <DataGrid
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
            id='counteragentCategories-autocomplete'
            label='CounteragentCategory'
            options={distinctCounteragentCategories} 
            selectedOptions={counteragentCategoriesIds}
            setStateFn={setCounteragentCategoriesIds}/>
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
          <AutocompleteComponent 
            id='currencies-autocomplete'
            label='Currency'
            options={distinctCurrencies} 
            selectedOptions={currencyIds}
            setStateFn={setCurrencyIds}/>
        </Paper>
      </Paper>
      <Typography variant='h4'>Bets</Typography>
      <Typography variant='h4'>Total of totals: {totalOfTotals}</Typography>
      {
        filteredRows
          ? (
              <Bets
                arePengindBets={false}
                isRead={true} 
                selectBetIdFn={selectBetId}
                setIsLoading={setIsLoading} 
                defaultRows={filteredRows}
                possibleCounteragents={allCounterAgents}
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
        filteredExpenseRowsRows && allCounterAgents && allCounterAgents.length > 0
          && areExpensesShown
          ? (
              <Expenses 
                isRead={false}
                setIsLoading={setIsLoading}
                defaultRows={filteredExpenseRowsRows}
                possibleCounterAgents={allCounterAgents}
              />
            )
          : null
      }
    </Paper>
    </>
   
  );
}
