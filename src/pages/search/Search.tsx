import React, { useEffect } from 'react';
import { UserContext, getUserFromLocalStorate, useAuth } from '../../contexts/AuthContext';
import { Autocomplete, Button, Checkbox, CircularProgress, FormControl, FormControlLabel, 
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
import { getBetStatistics, getCompletedBets, getCounterAgents, 
  getCurrencies, getExpenses, getMarkets, getSports, getTournaments } from '../../api';
import { Currency, Expense, Statistics } from '../../database-models';
import { FilterType, StatisticType, } from '../../models/enums';
import Expenses from '../../components/Expenses/Expenses';
import { betToBetModelMapper } from '../../utils';

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />;
const checkedIcon = <CheckBoxIcon fontSize='small' />;

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
  width?: number;
}) => {
  const { id, label, selectedOptions, setStateFn, width, } = props;
  const options = props.options.sort((a, b) => a.label.localeCompare(b.label));
  return (
    <Autocomplete
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
      style={{ width: width ? width : 500 }}
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
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [selectedBetId, setSelectedBetId] = React.useState<number | undefined>(
    undefined
  );
  const [statisticsType, setStatisticsType] = React.useState<StatisticType>(StatisticType.Flat);
  const [filterType, setFilterType] = React.useState<FilterType>(FilterType.Both);
  const [currentStatistcs, setCurrentStatistcs] = React.useState<
    Array<StatisticItemModel> | undefined
  >(undefined);

  //#region Filters

  const [betId, setBetId] = React.useState<number | undefined>(undefined);
  const [expenseId, setExpenseId] = React.useState<number | undefined>(undefined);
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = React.useState<Date | undefined>(undefined);
  const [stakeFrom, setStakeFrom] = React.useState<number | undefined>(undefined);
  const [stakeTo, setStakeTo] = React.useState<number | undefined>(undefined);
  const [oddFrom, setOddFrom] = React.useState<number | undefined>(undefined);
  const [oddTo, setOddTo] = React.useState<number | undefined>(undefined);
  const [psLimitFrom, setPsLimitFrom] = React.useState<number | undefined>(undefined);
  const [psLimitTo, setPsLimitTo] = React.useState<number | undefined>(undefined);

  const [counteragentCategoriesIds, setCounteragentCategoriesIds] = React.useState<Array<string>>([]);
  const [counteragentIds, setCounteragentIds] = React.useState<Array<string>>([]);
  const [sportIds, setSportIds] = React.useState<Array<string>>([]);
  const [marketIds, setMarketIds] = React.useState<Array<string>>([]);
  const [tournamentIds, setTournamentIds] = React.useState<Array<string>>([]);
  const [selectionIds, setSelectionIds] = React.useState<Array<string>>([]);
  const [liveStatusIds, setLiveStatusIds] = React.useState<Array<string>>([]);
  const [currencyIds, setCurrencyIds] = React.useState<Array<string>>([]);

  const [totalOfTotals, setTotalOfTotals ] = React.useState<number>(0);
  const [totalOfProfits, setTotalProfits ] = React.useState<number>(0);
  const [winrate, setWinrate ] = React.useState<number>(0);

  const [totalOfTotalsFlat, setTotalOfTotalsFlat ] = React.useState<number>(0);
  const [totalOfProfitsFlat, setTotalOfProfitsFlat ] = React.useState<number>(0);

  const [activateFilter, setActivateFilter ] = React.useState<boolean>(false);

  //#endregion Filters

  const [rows, setRows] = React.useState<Array<BetModel> | undefined>(
    undefined
  );
  const [filteredRows, setFilteredRows] = React.useState<
    Array<BetModel> | undefined
  >(undefined);

  const [expenseRows, setExpenseRows] = React.useState<
    Array<ExpenseModel> | undefined
  >(undefined);
  const [filteredExpenseRowsRows, setFilteredExpenseRows] = React.useState<
    Array<ExpenseModel> | undefined
  >(undefined);

  const [allCounterAgents, setAllCounterAgents] = React.useState<
    Array<IDropdownValue> | undefined
  >(undefined);
  const [allSports, setAllSports] = React.useState<
    Array<IDropdownValue> | undefined
  >(undefined);
  const [allTournaments, setAllTournaments] = React.useState<
    Array<IDropdownValue> | undefined
  >(undefined);
  const [allMarkets, setAllMarkets] = React.useState<
    Array<IDropdownValue> | undefined
  >(undefined);
  const [allSelections, setAllSelections] = React.useState<
    ISelectionsResult | undefined
  >(undefined);
  const [allCurrencies, setAllCurrencies] = React.useState<
    Array<Currency> | undefined
  >(undefined);

  const [databaseCurrencies, setDatabaseCurrencies] = React.useState<
    Array<Currency> | undefined
  >(undefined);

  const { auth } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        //#region Filters

        const dateFrom: Date = new Date();
        dateFrom.setMonth(dateFrom.getMonth() - 6);
        const now = new Date();

        setDateFrom(dateFrom);
        setDateTo(new Date());

        //#endregion Filters

        //#region Bets

        let completedBets: Array<BetModel> = (await getCompletedBets())!.map(
          betToBetModelMapper
        );

        setRows(completedBets);
        const filteredRows: Array<BetModel> =
          filterType === FilterType.Bets || filterType === FilterType.Both
            ? completedBets.filter((b) => {
                if (b.dateCreated) {
                  return (
                    b.dateCreated.getTime() > dateFrom.getTime() &&
                    b.dateCreated.getTime() < now.getTime()
                  );
                } else {
                  return false;
                }
              })
            : completedBets;
        setFilteredRows(filteredRows);
        let calculatedTotalOfTotals = filteredRows
          ? filteredRows.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.totalAmount) {
                return accumulator + currentValue.totalAmount;
              } else {
                return accumulator;
              }
            }, 0)
          : 0;
	      setTotalOfTotals(calculatedTotalOfTotals);
        setTotalOfTotalsFlat(filteredRows ? filteredRows.length : 0);

        let calculatedTotalProfits = filteredRows
          ? filteredRows.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.profits) {
                return accumulator + Number(currentValue.profits);
              } else {
                return accumulator;
              }
            }, 0)
          : 0;
	      setTotalProfits(calculatedTotalProfits);

        let calculatedTotalProfitsFlat = filteredRows
          ? filteredRows.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.profits) {
                return accumulator + 1;
              } else {
                return accumulator;
              }
            }, 0)
          : 0;
	      setTotalOfProfitsFlat(calculatedTotalProfitsFlat);

        const winRate = filteredRows
          ? (filteredRows.filter((b) => b.winStatus &&  (b.winStatus.id === '1' 
              || b.winStatus.id === '3')).length/filteredRows.length) * 100
          : 0;
        setWinrate(winRate);

        //#endregion Bets

        //#region Expenses

        let expenses: Array<ExpenseModel> = (await getExpenses())!.map(
          (expense: Expense): ExpenseModel => {
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
              counterAgentCategory:
                expense.counteragent &&
                expense.counteragent.counteragentCategory
                  ? {
                      id: expense.counteragent.counteragentCategory,
                      label: expense.counteragent.counteragentCategory,
                    }
                  : undefined,

              actionTypeApplied: undefined,
              isSavedInDatabase: true,
            };
          }
        );

        setExpenseRows(expenses);
        if (
          filterType === FilterType.Expenses ||
          filterType === FilterType.Both
        ) {
          setFilteredExpenseRows(
            expenses.filter((expense) => {
              if (expense.dateCreated) {
                return (
                  expense.dateCreated.getTime() > dateFrom.getTime() &&
                  expense.dateCreated.getTime() < now.getTime()
                );
              } else {
                return false;
              }
            })
          );
        } else {
          setFilteredExpenseRows(expenses);
        }

        //#endregion Expenses

        //#region Counteragents

        const getCounterAgentsResult = await getCounterAgents();
        const counterAgents: Array<IDropdownValue> = getCounterAgentsResult
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
          '1': ['Selection 1'],
          '2': ['Selection 1', 'Selection 2'],
          '3': ['Selection 1', 'Selection 2', 'Selection 3'],
          '4': ['Selection 1', 'Selection 2', 'Selection 3', 'Selection 4'],
          '5': [
            'Selection 1',
            'Selection 2',
            'Selection 3',
            'Selection 4',
            'Selection 5',
          ],
        };
        setAllSelections(getSelectionsResult);

        //#endregion Selections

        //#region Sports

        const getSportsResult = await getSports();
        const sports: Array<IDropdownValue> = getSportsResult
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
        const tournaments: Array<IDropdownValue> = getTournamentsResult
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
        const markets: Array<IDropdownValue> = getMarketsResult
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

        let getCurrenciesResult: Array<Currency> | undefined =
          await getCurrencies();
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
      const user: UserContext | undefined = getUserFromLocalStorate();
      if(counteragentIds.length === 0 && parseInt(user!.role) !== 1) {
        let calculatedTotalOfTotals = rows
          ? rows.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.totalAmount) {
              return accumulator + currentValue.totalAmount;
              } else {
              return accumulator;
              }
            }, 0)
          : 0;
	      setTotalOfTotals(calculatedTotalOfTotals);
        setTotalOfTotalsFlat(rows ? rows.length : 0);

        let calculatedTotalProfits = rows
          ? rows.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.profits) {
              return accumulator + Number(currentValue.profits);
              } else {
              return accumulator;
              }
            }, 0)
          : 0;
        setTotalProfits(calculatedTotalProfits);

        let calculatedTotalProfitsFlat = rows
          ? rows.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.profits) {
                return accumulator + 1;
              } else {
                return accumulator;
              }
            }, 0)
          : 0;
	      setTotalOfProfitsFlat(calculatedTotalProfitsFlat);

        const winRate = rows
          ? (rows.filter((b) => b.winStatus &&  (b.winStatus.id === '1' 
              || b.winStatus.id === '3')).length/rows.length) * 100
          : 0;
        setWinrate(winRate);

        return rows ? rows : [];
      }

      if (rows) {
        const bets: Array<BetModel> = [];
        for (var i = 0; i <= rows?.length - 1; i++) {
          const currentRow = rows[i];
          if (
            filterType !== FilterType.Bets &&
            filterType !== FilterType.Both
          ) {
            bets.push(currentRow);
            continue;
          }

          if (betId) {
            if (currentRow.id !== betId) {
              continue;
            }
          }

          //#region Counteragent category filter

          if (counteragentCategoriesIds.length > 0) {
            const matchCounteragentCategories =
              !!currentRow.counterAgentCategory &&
              counteragentCategoriesIds.indexOf(
                currentRow.counterAgentCategory.id
              ) !== -1;

            if (!matchCounteragentCategories) {
              continue;
            }
          }

          //#endregion Counteragent category filter

          //#region Counteragent filter

          if (counteragentIds.length > 0) {
            const matchCounteragents =
              !!currentRow.counterAgent &&
              counteragentIds.indexOf(currentRow.counterAgent.id) !== -1;

            if (!matchCounteragents) {
              continue;
            }
          }

          //#endregion Counteragent filter

          //#region Sport filter

          if (sportIds.length > 0) {
            const matchSports =
              !!currentRow.sport &&
              sportIds.indexOf(currentRow.sport.id) !== -1;

            if (!matchSports) {
              continue;
            }
          }

          //#endregion Sport filter

          //#region Market filter

          if (marketIds.length > 0) {
            const matchMarkets =
              !!currentRow.market &&
              marketIds.indexOf(currentRow.market.id) !== -1;

            if (!matchMarkets) {
              continue;
            }
          }

          //#endregion Market filter

          //#region Tournament filter

          if (tournamentIds.length > 0) {
            const matchTournaments =
              !!currentRow.tournament &&
              tournamentIds.indexOf(currentRow.tournament.id) !== -1;

            if (!matchTournaments) {
              continue;
            }
          }

          //#endregion Tournament filter

          //#region Tournament filter

          if (selectionIds.length > 0) {
            const matchSelections =
              !!currentRow.selection &&
              selectionIds.indexOf(currentRow.selection.id) !== -1;

            if (!matchSelections) {
              continue;
            }
          }

          //#endregion Tournament filter

          //#region Live status filter

          if (liveStatusIds.length > 0) {
            const matchLiveStatuses =
              !!currentRow.liveStatus &&
              liveStatusIds.indexOf(currentRow.liveStatus.id) !== -1;

            if (!matchLiveStatuses) {
              continue;
            }
          }

          //#endregion Live status filter

          //#region Currency filter

          if (currencyIds.length > 0) {
            if (!currentRow.amounts || currentRow.amounts.length === 0) {
              continue;
            }

            const matchCurrencies = (currentRow.amounts as any).some(
              (a: any) => {
                return (
                  currencyIds.indexOf(a.currencyId.toString()) !== -1 &&
                  a.amount > 0
                );
              }
            );

            if (!matchCurrencies) {
              continue;
            }
          }

          //#endregion Currency filter

          //#region DateFrom - DateTo filter

          let matchDateCreated = false;
          if (currentRow.dateCreated) {
            const rowDate = new Date(
              Date.UTC(
                currentRow.dateCreated.getFullYear(),
                currentRow.dateCreated.getMonth(),
                currentRow.dateCreated.getDate()
              )
            );

            if (dateFrom && dateTo) {
              const dateFromDate = new Date(
                Date.UTC(
                  dateFrom.getFullYear(),
                  dateFrom.getMonth(),
                  dateFrom.getDate()
                )
              );
              const dateToDate = new Date(
                Date.UTC(
                  dateTo.getFullYear(),
                  dateTo.getMonth(),
                  dateTo.getDate()
                )
              );

              if (
                rowDate.getTime() >= dateFromDate.getTime() &&
                rowDate.getTime() <= dateToDate.getTime()
              ) {
                matchDateCreated = true;
              }
            } else if (dateFrom && !dateTo) {
              const dateFromDate = new Date(
                Date.UTC(
                  dateFrom.getFullYear(),
                  dateFrom.getMonth(),
                  dateFrom.getDate()
                )
              );
              if (rowDate.getTime() >= dateFromDate.getTime()) {
                matchDateCreated = true;
              }
            } else if (!dateFrom && dateTo) {
              const dateToDate = new Date(
                Date.UTC(
                  dateTo.getFullYear(),
                  dateTo.getMonth(),
                  dateTo.getDate()
                )
              );
              if (rowDate.getTime() <= dateToDate.getTime()) {
                matchDateCreated = true;
              }
            } else {
              matchDateCreated = true;
            }
          }

          if (!matchDateCreated) {
            continue;
          }

          //#endregion DateFrom - DateTo filter

          //#region StakeFrom - StakeTo filter

          let matchStake = true;
          if (typeof currentRow.stake !== 'undefined') {
            if (
              typeof stakeFrom !== 'undefined' &&
              typeof stakeTo !== 'undefined' &&
              (currentRow.stake < stakeFrom || currentRow.stake > stakeTo)
            ) {
              matchStake = false;
            } else if (
              typeof stakeFrom !== 'undefined' &&
              typeof stakeTo === 'undefined' &&
              currentRow.stake < stakeFrom
            ) {
              matchStake = false;
            } else if (
              typeof stakeFrom === 'undefined' &&
              typeof stakeTo !== 'undefined' &&
              currentRow.stake > stakeTo
            ) {
              matchStake = false;
            }
          }

          if (!matchStake) {
            continue;
          }

          //#endregion StakeFrom - StakeTo filter

          //#region OddFrom - OddTo filter

          let matchOdd = true;
          if (typeof currentRow.odd !== 'undefined') {
            if (
              typeof oddFrom !== 'undefined' &&
              typeof oddTo !== 'undefined' &&
              (currentRow.odd < oddFrom || currentRow.odd > oddTo)
            ) {
              matchOdd = false;
            } else if (
              typeof oddFrom !== 'undefined' &&
              typeof oddTo === 'undefined' &&
              currentRow.odd < oddFrom
            ) {
              matchOdd = false;
            } else if (
              typeof oddFrom === 'undefined' &&
              typeof oddTo !== 'undefined' &&
              currentRow.odd > oddTo
            ) {
              matchOdd = false;
            }
          }

          if (!matchOdd) {
            continue;
          }

          //#endregion OddFrom - OddTo filter

          //#region PsLimitFrom - PsLimitTo filter

          let matchPsLimit = true;
          if (typeof currentRow.psLimit !== 'undefined') {
            if (
              typeof psLimitFrom !== 'undefined' &&
              typeof psLimitTo !== 'undefined' &&
              (currentRow.psLimit < psLimitFrom ||
                currentRow.psLimit > psLimitTo)
            ) {
              matchPsLimit = false;
            } else if (
              typeof psLimitFrom !== 'undefined' &&
              typeof psLimitTo === 'undefined' &&
              currentRow.psLimit < psLimitFrom
            ) {
              matchPsLimit = false;
            } else if (
              typeof psLimitFrom === 'undefined' &&
              typeof psLimitTo !== 'undefined' &&
              currentRow.psLimit > psLimitTo
            ) {
              matchPsLimit = false;
            }
          }

          if (!matchPsLimit) {
            continue;
          }

          //#endregion PsLimitFrom - PsLimitTo filter

          bets.push(currentRow);
        }

        if (databaseCurrencies && currencyIds.length > 0) {
          const filteredCurrencies: Array<Currency> = databaseCurrencies.filter(
            (c) => currencyIds.indexOf(c.id.toString()) !== -1
          );

          setAllCurrencies(filteredCurrencies);

          for (var i = 0; i <= bets.length - 1; i++) {
            const currentBet = bets[i];
            if (!currentBet.amounts) {
              continue;
            }

            let totalAmount = 0;
            for (var j = 0; j <= currentBet.amounts.length - 1; j++) {
              const currentAmount: any = currentBet.amounts[j];
              if (
                currencyIds.indexOf(currentAmount.currencyId.toString()) === -1
              ) {
                continue;
              }

              const databaseCurrency = databaseCurrencies.find(
                (dC) => dC.id === currentAmount.currencyId
              );
              totalAmount +=
                currentAmount.amount * databaseCurrency!.conversionRateToBGN;
            }

            currentBet.totalAmount = totalAmount;
          }
        } else {
          setAllCurrencies(databaseCurrencies);
        }

        let calculatedTotalOfTotals = bets
          ? bets.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.totalAmount) {
              return accumulator + currentValue.totalAmount;
              } else {
              return accumulator;
              }
            }, 0)
          : 0;

        setTotalOfTotals(calculatedTotalOfTotals);
        setTotalOfTotalsFlat(bets ? bets.length : 0);

        let calculatedTotalProfits = bets
          ? bets.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.profits) {
              return accumulator + Number(currentValue.profits);
              } else {
              return accumulator;
              }
            }, 0)
          : 0;
        setTotalProfits(calculatedTotalProfits);

        let calculatedTotalProfitsFlat = bets
          ? bets.reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.profits) {
                return accumulator + 1;
              } else {
                return accumulator;
              }
            }, 0)
          : 0;
	      setTotalOfProfitsFlat(calculatedTotalProfitsFlat);

        const winRate = bets
            ? (bets.filter((b) => b.winStatus &&  (b.winStatus.id === '1' 
                || b.winStatus.id === '3')).length/bets.length) * 100
            : 0;
        setWinrate(winRate);

        return bets;
      } else {
        setTotalOfTotals(0);
        setTotalProfits(0);
        setWinrate(0);
        setTotalOfTotalsFlat(0);
        setTotalOfProfitsFlat(0);
        return [];
      }
    });
  }, [
    activateFilter,
    rows,
    filterType,
  ]);

  useEffect(() => {
    setFilteredExpenseRows(
      (previousRowsModel: Array<ExpenseModel> | undefined) => {
        if (expenseRows) {
          const expenses: Array<ExpenseModel> = [];
          for (var i = 0; i <= expenseRows.length - 1; i++) {
            const currentRow = expenseRows[i];
            if (
              filterType !== FilterType.Expenses &&
              filterType !== FilterType.Both
            ) {
              expenses.push(currentRow);
              continue;
            }

            if (expenseId) {
              if (currentRow.id !== expenseId) {
                continue;
              }
            }

            //#region Counteragent Category filter

            if (counteragentCategoriesIds.length > 0) {
              const matchCounteragentCategories =
                !!currentRow.counterAgentCategory &&
                counteragentCategoriesIds.indexOf(
                  currentRow.counterAgentCategory.id
                ) !== -1;

              if (!matchCounteragentCategories) {
                continue;
              }
            }

            //#endregion Counteragent Category filter

            //#region Counteragent filter

            if (counteragentIds.length > 0) {
              const matchCounteragents =
                !!currentRow.counterAgent &&
                counteragentIds.indexOf(currentRow.counterAgent.id) !== -1;

              if (!matchCounteragents) {
                continue;
              }
            }

            //#endregion Counteragent filter

            //#region DateFrom - DateTo filter

            let matchDateCreated = false;
            if (currentRow.dateCreated) {
              const rowDate = new Date(
                Date.UTC(
                  currentRow.dateCreated.getFullYear(),
                  currentRow.dateCreated.getMonth(),
                  currentRow.dateCreated.getDate()
                )
              );

              if (dateFrom && dateTo) {
                const dateFromDate = new Date(
                  Date.UTC(
                    dateFrom.getFullYear(),
                    dateFrom.getMonth(),
                    dateFrom.getDate()
                  )
                );
                const dateToDate = new Date(
                  Date.UTC(
                    dateTo.getFullYear(),
                    dateTo.getMonth(),
                    dateTo.getDate()
                  )
                );

                if (
                  rowDate.getTime() >= dateFromDate.getTime() &&
                  rowDate.getTime() <= dateToDate.getTime()
                ) {
                  matchDateCreated = true;
                }
              } else if (dateFrom && !dateTo) {
                const dateFromDate = new Date(
                  Date.UTC(
                    dateFrom.getFullYear(),
                    dateFrom.getMonth(),
                    dateFrom.getDate()
                  )
                );
                if (rowDate.getTime() >= dateFromDate.getTime()) {
                  matchDateCreated = true;
                }
              } else if (!dateFrom && dateTo) {
                const dateToDate = new Date(
                  Date.UTC(
                    dateTo.getFullYear(),
                    dateTo.getMonth(),
                    dateTo.getDate()
                  )
                );
                if (rowDate.getTime() <= dateToDate.getTime()) {
                  matchDateCreated = true;
                }
              } else {
                matchDateCreated = true;
              }
            }

            if (!matchDateCreated) {
              continue;
            }

            //#endregion DateFrom - DateTo filter

            expenses.push(currentRow);
          }

          return expenses;
        } else {
          return [];
        }
      }
    );
  }, [
    expenseId,
    dateFrom,
    dateTo,
    counteragentCategoriesIds,
    counteragentIds,
    expenseRows,
    filterType,
  ]);

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
            profit: betStatistics.allTime.profit.toFixed(2),
            turnOver: betStatistics.allTime.turnOver.toFixed(2),
            winRate: (betStatistics.allTime.winRate * 100).toFixed(2) + '%',
            yield: (betStatistics.allTime.yield * 100).toFixed(2) + '%',
          },
          {
            id: 2,
            periodType: 'last 3m',
            profit: betStatistics.threeMonths.profit.toFixed(2),
            turnOver: betStatistics.threeMonths.turnOver.toFixed(2),
            winRate: (betStatistics.threeMonths.winRate * 100).toFixed(2) + '%',
            yield: (betStatistics.threeMonths.yield * 100).toFixed(2) + '%',
          },
          {
            id: 3,
            periodType: 'last 6m',
            profit: betStatistics.sixMonths.profit.toFixed(2),
            turnOver: betStatistics.sixMonths.turnOver.toFixed(2),
            winRate: (betStatistics.sixMonths.winRate * 100).toFixed(2) + '%',
            yield: (betStatistics.sixMonths.yield * 100).toFixed(2) + '%',
          },
        ];

        setCurrentStatistcs(statisticsModel);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedBetId, statisticsType]);

  const selectBetId = async (id: number) => {
    setSelectedBetId(id);
  };

  const distinctCounteragentCategories: Array<IDropdownValue> = (
    filteredRows
      ? [
          ...new Set(
            filteredRows
              .filter((b: BetModel) => !!b.counterAgentCategory)
              .map((b) => b.counterAgentCategory!.id)
          ),
        ]
      : []
  ).map((counterAgentCategoryId: string) => {
    const model = filteredRows!.find(
      (r) =>
        r.counterAgentCategory &&
        r.counterAgentCategory.id === counterAgentCategoryId
    );

    return {
      id: model?.counterAgentCategory?.id,
      label: model?.counterAgentCategory?.label,
    } as IDropdownValue;
  });

  const distinctCounteragents: Array<IDropdownValue> = (
    filteredRows
      ? [
          ...new Set(
            filteredRows
              .filter((b: BetModel) => !!b.counterAgent)
              .map((b) => b.counterAgent!.id)
          ),
        ]
      : []
  ).map((counterAgentId: string) => {
    const model = filteredRows!.find(
      (r) => r.counterAgent && r.counterAgent.id === counterAgentId
    );

    return {
      id: model?.counterAgent?.id,
      label: model?.counterAgent?.label,
    } as IDropdownValue;
  });

  const distinctSports: Array<IDropdownValue> = (
    filteredRows
      ? [
          ...new Set(
            filteredRows
              .filter((b: BetModel) => !!b.sport)
              .map((b: BetModel) => b.sport!.id)
          ),
        ]
      : []
  ).map((b) => {
    return { id: b, label: b } as IDropdownValue;
  });

  const distinctMarkets: Array<IDropdownValue> = (
    filteredRows
      ? [
          ...new Set(
            filteredRows
              .filter((b: BetModel) => !!b.market)
              .map((b: BetModel) => b.market!.id)
          ),
        ]
      : []
  ).map((b) => {
    return { id: b, label: b } as IDropdownValue;
  });

  const distinctTournaments: Array<IDropdownValue> = (
    filteredRows
      ? [
          ...new Set(
            filteredRows
              .filter((b: BetModel) => !!b.tournament)
              .map((b: BetModel) => b.tournament!.id)
          ),
        ]
      : []
  ).map((b) => {
    return { id: b, label: b } as IDropdownValue;
  });

  const distinctSelections: Array<IDropdownValue> = (
    filteredRows
      ? [
          ...new Set(
            filteredRows
              .filter((b: BetModel) => !!b.selection)
              .map((b: BetModel) => b.selection!.id)
          ),
        ]
      : []
  ).map((b) => {
    return { id: b, label: b } as IDropdownValue;
  });

  const distinctLiveStatuses: Array<IDropdownValue> = (
    filteredRows
      ? [
          ...new Set(
            filteredRows
              .filter((b: BetModel) => !!b.liveStatus)
              .map((b) => b.liveStatus!.id)
          ),
        ]
      : []
  ).map((liveStatusId) => {
    const model = filteredRows!.find(
      (r) => r.liveStatus && r.liveStatus.id === liveStatusId
    );

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

  const onTotalOfTotalAmountsChangedHandler = (totalOfTotals: number) => {
    setTotalOfTotals(totalOfTotals);
  }

  return (
    <Paper>
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
      <Paper sx={{ paddingLeft: '2%'}}>
        <Typography variant='h1'>
          Search
        </Typography>
        {
          currentStatistcs 
            ? (
                <Paper>
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
                  <DataGrid 
                    columns={statisticsColumns} 
                    rows={currentStatistcs} 
                    pageSizeOptions={[]}
                    autoPageSize={false}
                    hideFooterPagination/>
                </Paper>
              ) 
            : null
        }
        <Paper>
          <Typography variant='h4'>Filter type</Typography>
          <RadioGroup
            aria-labelledby='demo-controlled-radio-buttons-group'
            name='controlled-radio-buttons-group'
            value={filterType}
            sx={{
              flexDirection: 'row',
            }}
            onChange={(event) => {
              const value: string = (event.target as HTMLInputElement).value;
              setFilterType(
                value === 'Bets'
                  ? FilterType.Bets
                  : value === 'Expenses'
                    ? FilterType.Expenses
                    : FilterType.Both
              );
            }}
          >
            <FormControlLabel value='Bets' control={<Radio />} label='Bets' />
            <FormControlLabel value='Expenses' control={<Radio />} label='Expenses' />
            <FormControlLabel value='Both' control={<Radio />} label='Both' />
          </RadioGroup>
        </Paper>
        <Paper>
          <Paper sx={{ marginTop: '1%',}}>
            <TextField
              id='betId'
              label='Bet id'
              variant='outlined'
              type='number'
              sx={{
                width: '15%',
              }}
              onChange={(e) => {
                const betId = parseInt(e.target.value);
                if (!isNaN(betId)) {
                  setBetId(betId);
                } else {
                  setBetId(undefined);
                }
              }}
            />
            <TextField
              id='expenseId'
              label='Expense id'
              variant='outlined'
              type='number'
              sx={{
                marginRight: '1%',
                width: '15%',
              }}
              onChange={(e) => {
                const expenseId = parseInt(e.target.value);
                if (!isNaN(expenseId)) {
                  setExpenseId(expenseId);
                } else {
                  setExpenseId(undefined);
                }
              }}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label='From'
                value={dayjs(dateFrom)}
                sx={{
                  width: '15%',
                }}
                onChange={(newValue) => {
                  setDateFrom(
                    newValue ? new Date(newValue?.toISOString()) : undefined
                  );
                }}
              />
              <DatePicker
                label='To'
                value={dayjs(dateTo)}
                sx={{
                  marginRight: '1%',
                  width: '15%',
                }}
                onChange={(newValue) => {
                  setDateTo(
                    newValue ? new Date(newValue?.toISOString()) : undefined
                  );
                }}
              />
            </LocalizationProvider>
            <TextField
              id='stake-from'
              label='Stake from'
              variant='outlined'
              type='number'
              sx={{
                width: '15%',
              }}
              onChange={(e) => {
                const stakeFrom = parseInt(e.target.value);
                if (!isNaN(stakeFrom)) {
                  setStakeFrom(stakeFrom);
                } else {
                  setStakeFrom(undefined);
                }
              }}
            />
            <TextField
              id='stake-to'
              label='Stake to'
              variant='outlined'
              type='number'
              sx={{
                width: '15%',
              }}
              onChange={(e) => {
                const stakeTo = parseInt(e.target.value);
                if (!isNaN(stakeTo)) {
                  setStakeTo(stakeTo);
                } else {
                  setStakeTo(undefined);
                }
              }}
            />
          </Paper>
          <Paper sx={{ display: 'block', marginTop: '1%',}}>
            <TextField
              id='odd-from'
              label='Odd from'
              variant='outlined'
              type='number'
              sx={{
                width: '15%',
              }}
              onChange={(e) => {
                const oddFrom = parseInt(e.target.value);
                if (!isNaN(oddFrom)) {
                  setOddFrom(oddFrom);
                } else {
                  setOddFrom(undefined);
                }
              }}
            />
            <TextField
              id='odd-to'
              label='Odd to'
              variant='outlined'
              type='number'
              sx={{
                marginRight: '1%',
                width: '15%',
              }}
              onChange={(e) => {
                const oddTo = parseInt(e.target.value);
                if (!isNaN(oddTo)) {
                  setOddTo(oddTo);
                } else {
                  setOddTo(undefined);
                }
              }}
            />

            <TextField
              id='psLimit-from'
              label='PsLimit from'
              variant='outlined'
              type='number'
              sx={{
                width: '15%',
              }}
              onChange={(e) => {
                const psLimitFrom = parseInt(e.target.value);
                if (!isNaN(psLimitFrom)) {
                  setPsLimitFrom(psLimitFrom);
                } else {
                  setPsLimitFrom(undefined);
                }
              }}
            />
            <TextField
              id='psLimit-to'
              label='PsLimit to'
              variant='outlined'
              type='number'
              sx={{
                marginRight: '1%',
                width: '15%',
              }}
              onChange={(e) => {
                const psLimitTo = parseInt(e.target.value);
                if (!isNaN(psLimitTo)) {
                  setPsLimitTo(psLimitTo);
                } else {
                  setPsLimitTo(undefined);
                }
              }}
            />
            <Paper sx={{ display: 'inline-block',}}>
              <AutocompleteComponent
                id='counteragentCategories-autocomplete'
                label='CounteragentCategory'
                options={distinctCounteragentCategories}
                selectedOptions={counteragentCategoriesIds}
                setStateFn={setCounteragentCategoriesIds}
                width={515}
              />
            </Paper>
          </Paper>
          <Paper>
            <Paper sx={{ display: 'inline-block', marginRight: '2%', marginTop: '1%', }}>
              <AutocompleteComponent
                id='counteragents-autocomplete'
                label='Counteragent'
                options={distinctCounteragents}
                selectedOptions={counteragentIds}
                setStateFn={setCounteragentIds}
              />
            </Paper>
            <Paper sx={{ display: 'inline-block', marginRight: '2%', marginTop: '1%', }}>
              <AutocompleteComponent
                id='sports-autocomplete'
                label='Sport'
                options={distinctSports}
                selectedOptions={sportIds}
                setStateFn={setSportIds}
              />
            </Paper>
            <Paper sx={{ display: 'inline-block', marginRight: '2%', marginTop: '1%', }}>
              <AutocompleteComponent
                id='markets-autocomplete'
                label='Market'
                options={distinctMarkets}
                selectedOptions={marketIds}
                setStateFn={setMarketIds}
              />
            </Paper>
            <Paper sx={{ display: 'inline-block', marginRight: '2%', marginTop: '1%', }}>
              <AutocompleteComponent
                id='tournaments-autocomplete'
                label='Tournament'
                options={distinctTournaments}
                selectedOptions={tournamentIds}
                setStateFn={setTournamentIds}
              />
            </Paper>
            <Paper sx={{ display: 'inline-block', marginRight: '2%', marginTop: '1%', }}>
              <AutocompleteComponent
                id='selections-autocomplete'
                label='Selections'
                options={distinctSelections}
                selectedOptions={selectionIds}
                setStateFn={setSelectionIds}
              />
            </Paper>
            <Paper sx={{ display: 'inline-block', marginRight: '2%',  marginTop: '1%',}}>
              <AutocompleteComponent
                id='liveStatuses-autocomplete'
                label='LiveStatus'
                options={distinctLiveStatuses}
                selectedOptions={liveStatusIds}
                setStateFn={setLiveStatusIds}
              />
            </Paper>
            <Paper sx={{ display: 'inline-block', marginRight: '2%', marginTop: '1%',}}>
              <AutocompleteComponent
                id='currencies-autocomplete'
                label='Currency'
                options={distinctCurrencies}
                selectedOptions={currencyIds}
                setStateFn={setCurrencyIds}
              />
            </Paper>
          </Paper>
        </Paper>
        <Paper sx={{ width: '100%', marginTop: '1%', marginBottom: '1%'}}>
          <Button onClick={() => setActivateFilter(!activateFilter)}
            variant='contained' 
            color='primary'
            sx={{
              width: '20%',
              marginLetf: '40%',
            }}>
            Filter
          </Button>
        </Paper>
        {

          filterType === FilterType.Bets || filterType === FilterType.Both
            ? (
                <Typography variant='h4'>Bets</Typography>
              )
            : <></>
        }
        {   
          filterType === FilterType.Bets || filterType === FilterType.Both
            ? (
                <Paper style={{ marginLeft: '60%', }}>
                  <Paper className='aggregatedLabel' sx={{
                    display: 'inline-block',
                  }}>
                    REAL TURNOVER:
                  </Paper> 
                  {
                    totalOfTotals && !isNaN(totalOfTotals)
                      ? Number(totalOfTotals).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : 0.00
                  }
      
                  <Paper className='aggregatedLabel' sx={{
                    display: 'inline-block',
                  }}>
                    REAL PROFIT:
                  </Paper>
                  {
                    totalOfProfits && !isNaN(totalOfProfits)
                      ? Number(totalOfProfits).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : 0.00
                  }
      
                  <Paper className='aggregatedLabel' sx={{
                    display: 'inline-block',
                  }}>
                    WINRATE:
                  </Paper>
                  {
                    winrate && !isNaN(winrate)
                      ? Number(winrate).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : 0.00
                  }%
      
                  <Paper className='aggregatedLabel' sx={{
                    display: 'inline-block',
                  }}>
                    REAL YIELD:
                  </Paper> 
                  {
                    totalOfProfits && !isNaN(totalOfProfits) && totalOfTotals && !isNaN(totalOfTotals)
                      ? ((totalOfProfits/totalOfTotals) * 100).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) + '%'
                      : "0.00%"
                  }
                  <br></br>
                  <Paper className='aggregatedLabel' sx={{
                    display: 'inline-block',
                  }}>
                    FLAT TURNOVER:
                  </Paper> 
                  {
                    totalOfTotalsFlat && !isNaN(totalOfTotalsFlat)
                      ? Number(totalOfTotalsFlat).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : 0.00
                  }
      
                  <Paper className='aggregatedLabel' sx={{
                    display: 'inline-block',
                  }}>
                    FLAT PROFIT:
                  </Paper>
                  {
                    totalOfProfitsFlat && !isNaN(totalOfProfitsFlat)
                      ? Number(totalOfProfitsFlat).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : 0.00
                  }
                  <Paper className='aggregatedLabel' sx={{
                    display: 'inline-block',
                  }}>
                    FLAT YIELD:
                  </Paper> 
                  {
                    totalOfProfitsFlat && !isNaN(totalOfProfitsFlat) && totalOfTotalsFlat && !isNaN(totalOfTotalsFlat)
                      ? ((totalOfProfitsFlat/totalOfTotalsFlat) * 100).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) + '%'
                      : "0.00%"
                  }
                </Paper>
                
              )
            : <></>
        }
        {
          filteredRows && (filterType === FilterType.Bets || filterType === FilterType.Both)
            ? (
                <Bets
                  id='search'
                  arePengindBets={false}
                  savedBet={(bets: Array<BetModel>, bet: BetModel) => {}}
                  onTotalOfTotalAmountsChanged={onTotalOfTotalAmountsChangedHandler}
                  selectBetIdFn={selectBetId}
                  setIsLoading={setIsLoading}
                  defaultRows={filteredRows}
                  possibleCounteragents={allCounterAgents}
                  possibleSports={allSports}
                  possibleTournaments={allTournaments}
                  possibleSelections={[]}
                  possibleMarkets={allMarkets}
                  currencies={allCurrencies}
                />
              ) 
            : null
        }
        {
          Number(auth.user?.role) === 1 && (filterType === FilterType.Expenses || filterType === FilterType.Both) && (
            <Typography variant='h4'>Expenses</Typography>
          )
        }
        
        {
          filteredExpenseRowsRows && allCounterAgents && allCounterAgents.length > 0 &&
            (filterType === FilterType.Expenses || filterType === FilterType.Both) && 
          Number(auth.user?.role) === 1 ? (
            <Expenses
              displayExportToolbar={true}
              isRead={false}
              setIsLoading={setIsLoading}
              defaultRows={filteredExpenseRowsRows}
              possibleCounterAgents={allCounterAgents}
            />
          ) : null
        }
      </Paper>
    </Paper>
  );
}
