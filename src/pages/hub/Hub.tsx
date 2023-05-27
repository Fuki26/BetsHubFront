import React, { useEffect } from 'react';
import { Paper, Typography} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import Bets, { ISelectionsResult } from '../../components/Bets/Bets';
import { BetModel } from '../../models';
import { getCompletedBets, getCounteragents, getMarkets, getPendingBets, getSelections, 
  getSports, getTournaments } from '../../api';
import { Bet } from '../../database-models';


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
  const [ date, setDate] = React.useState<Date | undefined>(undefined);
  const [ pendingRows, setPendingRows] = React.useState<Array<BetModel> | null>(null);
  const [ filteredPendingRows, setFilteredPendingRows] = React.useState<Array<BetModel> | null>(null);
  const [ possibleCounteragents, setCounteragents ] = React.useState<Array<{ id: number; name: string; }> | null>(null);
  const [ possibleSports, setSports ] = React.useState<Array<string> | null>(null);
  const [ possibleTournaments, setTournaments ] = React.useState<Array<string> | null>(null);
  const [ possibleMarkets, setMarkets ] = React.useState<Array<string> | null>(null);
  const [ possibleSelections, setSelections ] = React.useState<ISelectionsResult | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let pendingBets: Array<BetModel> = (await getPendingBets())!.map(betToBetModelMapper);
        let completedBets: Array<BetModel> = (await getCompletedBets())!.map(betToBetModelMapper);
        const getAllCounteragentsResult = await getCounteragents();
        const getAllSportsResult = await getSports();
        const getAllMarketsResult = await getMarkets();
        const getAllTournamentsResult = await getTournaments();
        const getAllSelectionsResult = await getSelections();

        setPendingRows(pendingBets);
        setFilteredPendingRows(pendingBets);
        // setCompletedRows(completedBets);
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
    setFilteredPendingRows((previousRowsModel: Array<BetModel> | null) => {
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
  }, [ date, ]);

  const selectedDateFn = (value: Date | null) => {
    setDate((value! as any).$d as Date);
  };

  const selectedBetFn = (selectedBet: BetModel) => {
    console.log(JSON.stringify(selectedBet));
  };

  return (
    <Paper sx={{ padding: '5%', }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar onChange={selectedDateFn}/>
      </LocalizationProvider>
      <Typography variant="h4">PENDING</Typography>
      {
        pendingRows && pendingRows.length > 0
          ? (
              <Bets selectedBetFn={selectedBetFn} defaultRows={filteredPendingRows}
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
