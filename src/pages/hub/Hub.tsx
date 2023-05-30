import React, { Profiler, useEffect } from 'react';
import { CircularProgress, FormControlLabel, Paper, Radio, RadioGroup, Typography} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import Bets from '../../components/Bets/Bets';
import { BetModel, ExpenseModel, ISelectionsResult, StatisticItemModel } from '../../models';
import { getBetStatistics, getCompletedBets, getCounteragents, getExpenses, getMarkets, 
  getPendingBets, getSelections, getSports, getTournaments } from '../../api';
import { Bet, Expense, Statistics } from '../../database-models';
import { StatisticType } from '../../models/enums';
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import Expenses from '../../components/Expenses/Expenses';


const betToBetModelMapper = (bet: Bet) => {
  return {
    id: bet.id,
    dateCreated: new Date(bet.dateCreated),
    betStatus: bet.betStatus,
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
    dateStaked: bet.dateStaked
      ? new Date(bet.dateStaked)
      : null,
    profits: bet.profits,
    notes: bet.notes,

    actionTypeApplied: undefined,
    isSavedInDatabase: true,
  } as BetModel;
};

export default function Hub() {
  const [ isLoading, setIsLoading, ] = React.useState<boolean>(false);
  
  const [ selectedBetId, setSelectedBetId, ] = React.useState<number | undefined>(undefined);
  const [ statisticsType, setStatisticsType, ] = React.useState<StatisticType>(StatisticType.Flat);
  const [ currentStatistcs, setCurrentStatistcs, ] = React.useState<Array<StatisticItemModel> | undefined>(undefined);
  
  const [ date, setDate] = React.useState<Date | undefined>(undefined);

  const [ pendingRows, setPendingRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [ completedRows, setCompletedRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [ filteredPendingRows, setFilteredPendingRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [ filteredCompletedRows, setFilteredCompletedRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [ possibleCounteragents, setCounteragents ] = 
    React.useState<Array<{ value: string; label: string; }> | undefined>(undefined);
  const [ possibleSports, setSports ] = 
    React.useState<Array<{ value: string; label: string; }> | undefined>(undefined);
  const [ possibleTournaments, setTournaments ] = 
    React.useState<Array<{ value: string; label: string; }> | undefined>(undefined);
  const [ possibleMarkets, setMarkets ] =
    React.useState<Array<{ value: string; label: string; }> | undefined>(undefined);
  // const [ possibleSelections, setSelections ] = React.useState<ISelectionsResult | undefined>(undefined);
  // const [ expensesRows, setExpensesRows] = React.useState<Array<ExpenseModel> | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        let pendingBets: Array<BetModel> = (await getPendingBets())!.map(betToBetModelMapper);
        let completedBets: Array<BetModel> = (await getCompletedBets())!.map(betToBetModelMapper);
        const getAllCounteragentsResult = await getCounteragents();
        const getAllSportsResult = await getSports();
        const getAllTournamentsResult = await getTournaments();
        const getAllMarketsResult = await getMarkets();
        
        // const getAllSelectionsResult = await getSelections();
        // const getAllExpenses: Array<Expense> | undefined  = await getExpenses();
        setIsLoading(false);

        setPendingRows(pendingBets);
        setCompletedRows(completedBets);
        setFilteredPendingRows(pendingBets);
        setFilteredCompletedRows(completedBets);

        const counterAgents: Array<{ value: string; label: string; }> | undefined = 
          getAllCounteragentsResult
            ? getAllCounteragentsResult.map((counteragent) => {
                return {
                  value: counteragent.id.toString(),
                  label: counteragent.name,
                };
              })
            : [];

        setCounteragents(counterAgents);

        const sports: Array<{ value: string; label: string; }> | undefined =
          getAllSportsResult
              ? getAllSportsResult.map((sport) => {
                  return {
                    value: sport,
                    label: sport,
                  };
                })
              : [];
        setSports(sports);

        const markets: Array<{ value: string; label: string; }> | undefined =
          getAllMarketsResult
              ? getAllMarketsResult.map((market) => {
                  return {
                    value: market,
                    label: market,
                  };
                })
              : [];
        setMarkets(markets);

        const tournaments: Array<{ value: string; label: string; }> | undefined =
          getAllTournamentsResult
              ? getAllTournamentsResult.map((tournament) => {
                  return {
                    value: tournament,
                    label: tournament,
                  };
                })
              : [];
        setTournaments(tournaments);

        // if(getAllSelectionsResult) {
        //   setSelections(getAllSelectionsResult);
        // }

        // setExpensesRows(getAllExpenses?.map((expense) => {
        //   return {
        //     id: expense.id,
        //     counteragentId: expense.counteragentId
        //       ? expense.counteragentId
        //       : undefined,
        //     counteragent: expense.counteragent
        //       ? expense.counteragent.name
        //       : undefined,
        //     amount: expense.amount,
        //     description: expense.description,
        //     dateCreated: new Date(expense.dateCreated),
        //     dateFrom: new Date(expense.dateFrom),
        //     dateTo: new Date(expense.dateTo), 

        //     actionTypeApplied: undefined,
        //     isSavedInDatabase: true,
        //   };
        // }));
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
            && currentRow.dateFinished.getTime() < date.getTime()) {
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
            && currentRow.dateFinished.getTime() < date.getTime()) {
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
            id: 2,
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
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar onChange={selectedDateFn}/>
      </LocalizationProvider>
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
      <Typography variant='h4'>PENDING</Typography>
      {
        filteredPendingRows
          ? (
              <Bets selectBetIdFn={selectBetId}
                setIsLoading={setIsLoading} 
                defaultRows={filteredPendingRows}
                possibleCounteragents={possibleCounteragents}
                possibleSports={possibleSports}
                possibleTournaments={possibleTournaments}
                possibleMarkets={possibleMarkets}
                // possibleSelections={possibleSelections}
              />
            )
          : null
      }

      <Typography variant='h4'>COMPLETED</Typography>
      {
        filteredCompletedRows
          ? (
              <Bets selectBetIdFn={selectBetId}
                setIsLoading={setIsLoading}
                defaultRows={filteredCompletedRows}
                possibleCounteragents={possibleCounteragents}
                possibleSports={possibleSports}
                possibleTournaments={possibleTournaments}
                possibleMarkets={possibleMarkets}
              />
            )
          : null
      }

      {/* <Typography variant='h4'>Expenses</Typography>
      {
        expensesRows
          ? (
              <Expenses 
                setIsLoading={setIsLoading}
                defaultRows={expensesRows}
                possibleCounteragents={possibleCounteragents}
              />
            )
          : null
      } */}
      
    </Paper>
  );
}
