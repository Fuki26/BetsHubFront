import React, { useEffect } from 'react';
import { CircularProgress, FormControlLabel, Paper, Radio, RadioGroup, Typography} from '@mui/material';
import Bets from '../../components/Bets/Bets';
import { BetModel, ISelectionsResult, StatisticItemModel } from '../../models';
import { getBetStatistics, getCompletedBets, getCounteragents, getExpenses, getMarkets, 
  getPendingBets, getSelections, getSports, getTournaments } from '../../api';
import { Bet, Statistics } from '../../database-models';
import { StatisticType } from '../../models/enums';
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


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

export default function Search() {
  const [ isLoading, setIsLoading, ] = React.useState<boolean>(false);
  
  const [ selectedBetId, setSelectedBetId, ] = React.useState<number | undefined>(undefined);
  const [ statisticsType, setStatisticsType, ] = React.useState<StatisticType>(StatisticType.Flat);
  const [ currentStatistcs, setCurrentStatistcs, ] = React.useState<Array<StatisticItemModel> | undefined>(undefined);
  
  const [ dateFrom, setDateFrom] = React.useState<Date | undefined>(undefined);
  const [ dateTo, setDateTo] = React.useState<Date | undefined>(undefined);

  const [ rows, setRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [ filteredRows, setFilteredRows] = React.useState<Array<BetModel> | undefined>(undefined);
  const [ possibleCounteragents, setCounteragents ] = React.useState<Array<{ id: number; name: string; }> | undefined>(undefined);
  const [ possibleSports, setSports ] = React.useState<Array<string> | undefined>(undefined);
  const [ possibleTournaments, setTournaments ] = React.useState<Array<string> | undefined>(undefined);
  const [ possibleMarkets, setMarkets ] = React.useState<Array<string> | undefined>(undefined);
  const [ possibleSelections, setSelections ] = React.useState<ISelectionsResult | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        let pendingBets: Array<BetModel> = (await getPendingBets())!.map(betToBetModelMapper);
        const getAllCounteragentsResult = await getCounteragents();
        const getAllSportsResult = await getSports();
        const getAllMarketsResult = await getMarkets();
        const getAllTournamentsResult = await getTournaments();
        const getAllSelectionsResult = await getSelections();
        setIsLoading(false);

        setRows(pendingBets);
        setFilteredRows(pendingBets);
        const counterAgents: Array<{ id: number; name: string; }> | undefined = getAllCounteragentsResult?.map((counteragent) => {
          return {
            id: counteragent.id,
            name: counteragent.name,
          };
        });

        setCounteragents(counterAgents ? counterAgents : []);

        if(getAllSportsResult) {
          setSports(getAllSportsResult);
        }

        if(getAllMarketsResult) {
          setMarkets(getAllMarketsResult);
        }

        if(getAllTournamentsResult) {
          setTournaments(getAllTournamentsResult);
        }

        if(getAllSelectionsResult) {
          setSelections(getAllSelectionsResult);
        }
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
  }, [ dateFrom, dateTo, ]);


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
        <DatePicker label="From" value={dateFrom} onChange={(newValue) => {
          setDateFrom(newValue ? new Date(newValue?.toISOString()) : undefined);
        }} />
        <DatePicker label="To" value={dateTo} onChange={(newValue) => {
          setDateTo(newValue ? new Date(newValue?.toISOString()) : undefined);
        }}/>
      </LocalizationProvider>
      <Typography variant='h4'>Bets</Typography>
      {
        filteredRows
          ? (
              <Bets selectBetIdFn={selectBetId}
                setIsLoading={setIsLoading} 
                defaultRows={filteredRows}
                possibleCounteragents={possibleCounteragents}
                possibleSports={possibleSports}
                possibleTournaments={possibleTournaments}
                possibleMarkets={possibleMarkets}
                possibleSelections={possibleSelections}
              />
            )
          : null
      }
    </Paper>
  );
}
