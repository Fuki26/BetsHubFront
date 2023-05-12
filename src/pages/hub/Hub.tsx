import { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGridPro, GridColDef, } from '@mui/x-data-grid-pro';
import { Paper, Typography} from '@mui/material';
import { Bet, } from '../../database-models';
import { GeneralBet, StatisticItem } from '../../models';
import GeneralTable from '../../components/GeneralTable/GeneralTable';


export default function Hub() {
  const [bets, setBets] = useState<Array<GeneralBet> | null>(null);

  useEffect(() => {
    (async function() {
      try {
        const getAllBetsResult = await axios.get("http://213.91.236.205:5000/GetAllBets");
        const allBets: Array<GeneralBet> = getAllBetsResult.data.map((bet: Bet) => {
          return {
            id: bet.id,
            dateCreated: new Date(bet.dateCreated),
            counteragent: bet.counteragent
              ? bet.counteragent.name
              : '',
            sport: bet.sport
              ? bet.sport.name
              : '',
            market: bet.market
              ? bet.market.name
              : '',
            stake: bet.stakeValue
              ? bet.stakeValue
              : 0,
            liveStatus: bet.liveStatus === 0
              ? 'PRE'
              : bet.liveStatus === 1
                ? 'LIVE'
                : '0-0',
            psLimit: bet.psLimit,
            tournament: bet.tournament
              ? bet.tournament.name
              : '',
            selection: bet.selection
              ? bet.selection.name
              : '',
            bgn: 0,
            usd: 0,
            eur: 0,
            bgp: 0,
            amount: bet.amount,
            odd: bet.odd,
            dateFinished: new Date(bet.dateFinished),
            //TODO: calculate
            dateStakedAndUserCreated: new Date(),
            //TODO: Match with..?
            expenseApplied: 0,
            //TODO: Match with..?
            brutPLN: 0,
            //TODO: Match with..?
            netPLN: 0,
            //TODO: Match with..?
            volume: 0,
            //TODO: Match with..?
            notes: '',


            savedInDatabase: true,
            isCanceled: false,
            parentId: null,
            clickedForChildren: false,
          } as GeneralBet;
        });
        
        setBets(allBets.sort((a: GeneralBet, b: GeneralBet) => {
          return a.dateCreated.getTime() > b.dateCreated.getTime() ? 1 : -1;
        }));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const statiticsColumns: Array<GridColDef> = [
    {
      field: 'period',
      headerName: 'period',
      width: 200,
      editable: false,
      resizable: true,
      sortable: true,
      hideable: true,
      type: 'string',
    },
    {
      field: 'pl',
      headerName: 'P/L',
      width: 200,
      editable: false,
      resizable: true,
      sortable: true,
      hideable: true,
      type: 'number',
    },
    {
      field: 'winRate',
      headerName: 'Win Rate',
      width: 200,
      editable: false,
      resizable: true,
      sortable: true,
      hideable: true,
      type: 'number',
    },
    {
      field: 'yield',
      headerName: 'Yield',
      width: 200,
      editable: false,
      resizable: true,
      sortable: true,
      hideable: true,
      type: 'number',
    },
    {
      field: 'turnover',
      headerName: 'Turnover',
      width: 200,
      editable: false,
      resizable: true,
      sortable: true,
      hideable: true,
      type: 'number',
    },
    {
      field: 'profit',
      headerName: 'Profit',
      width: 200,
      editable: false,
      resizable: true,
      sortable: true,
      hideable: true,
      type: 'number',
    },
  ];

  const statiticsRows: Array<StatisticItem> = [
    {
      id: 1,
      periodType: 'CalendarBased',
      period: 'results by the choosen date of the calendar initially the current day',
      pl: '',
      winRate: '',
      yield: '',
      turnover: '',
      profit: '',
    },
    {
      id: 2,
      periodType: '3mTillToday',
      period: '3m till today',
      pl: '',
      winRate: '',
      yield: '',
      turnover: '',
      profit: '',
    },
    {
      id: 3,
      periodType: '6mTillToday',
      period: '6m till today',
      pl: '',
      winRate: '',
      yield: '',
      turnover: '',
      profit: '',
    },
  ];

  const betsColumns: Array<GridColDef> = [
    {
      field: 'id',
    },
    { 
      field: 'dateCreated', 
      headerName: 'Date created', 
      editable: true,
      width: 100,
      type: 'dateTime',
    },
    { 
      field: 'counteragent', 
      headerName: 'Couteragent', 
      editable: true,
      width: 100,
      type: 'singleSelect',
      valueOptions: ['Counteragent 1', 'Counteragent 2', 'Counteragent 3'],
    },
    { 
      field: 'sport', 
      headerName: 'Sport',
      editable: true, 
      width: 100,
      type: 'singleSelect',
      valueOptions: ['Sport 1', 'Sport 2', 'Sport 3'],
    },
    { 
      field: 'market', 
      headerName: 'Market',
      editable: true, 
      width: 100,
      type: 'singleSelect',
      valueOptions: ['Market 1', 'Market 2', 'Market 3'],
    },
    { 
      field: 'stake', 
      headerName: 'Stake',
      editable: true, 
      width: 100,
      type: 'singleSelect',
      valueOptions: [1, 2, 3, 4, 5],
    },
    { 
      field: 'liveStatus', 
      headerName: 'PRE/LIVE',
      editable: true, 
      width: 100,
      type: 'singleSelect',
      valueOptions: [ 'PRE', 'LIVE', '0-0'],
    },
    { 
      field: 'psLimit', 
      headerName: 'PS Limit',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: 'tournament', 
      headerName: 'Tournament',
      editable: true, 
      width: 100,
      type: 'singleSelect',
      valueOptions: ['Tournament 1', 'Tournament 2', 'Tournament 3'],
    },
    { 
      field: 'selection', 
      headerName: 'Selection',
      editable: true, 
      width: 100,
      type: 'singleSelect',
      valueOptions: ['Selection 1', 'Selection 2', 'Selection 3'],
    },
    { 
      field: 'bgn', 
      headerName: 'BGN',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: 'usd', 
      headerName: 'USD',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: 'eur', 
      headerName: 'EUR',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: 'bgp', 
      headerName: 'BGP',
      editable: true, 
      width: 100,
      type: 'number',
    },
    // TODO: Sum after enter 150 + 150 = 300, 0 - reset
    { 
      field: 'amount', 
      headerName: 'Amount',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: 'odd', 
      headerName: 'ODD',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: 'dateFinished', 
      headerName: 'Date finished',
      editable: true, 
      width: 100,
      type: 'dateTime',
    },
    { 
      field: 'dateStakedAndUserCreated', 
      headerName: 'Date Staked & User created',
      editable: true, 
      width: 100,
      type: 'dateTime',
    },
    { 
      field: 'expenseApplied', 
      headerName: 'Expense applied',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: 'brutPLN', 
      headerName: 'W/L (Brut PLN)',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: 'netPLN', 
      headerName: 'NET PLN',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: 'volume', 
      headerName: 'Volume',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: 'notes', 
      headerName: 'Notes',
      editable: true, 
      width: 200,
      type: 'string',
    },
  ];
  const betsData: Array<GeneralBet> | null = bets ? bets : null;

  return (
    <Paper sx={{ padding: '5%', }}>
      <Typography variant="h4">Stats</Typography>
      <DataGridPro
        columns={statiticsColumns}
        rows={statiticsRows}   
      />
      {
        betsData 
          ? (
              <>
                <Typography variant="h4">PENDING</Typography>
                <GeneralTable<GeneralBet>  columns={betsColumns} initialRows={betsData}/>
                <Typography variant="h4">COMPLETED</Typography>
                <GeneralTable<GeneralBet>  columns={betsColumns} initialRows={betsData}/>
              </>
            )
          : null
      }
    </Paper>
  );
}
