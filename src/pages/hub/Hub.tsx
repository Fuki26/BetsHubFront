import { useEffect, useState } from 'react';
import axios from 'axios';
import { GridColDef, GridRowsProp, GridToolbar, } from '@mui/x-data-grid-pro';
import { Paper, Typography} from '@mui/material';
import { FullFeaturedCrudGrid } from '../search'; 
import { Bet, Expense } from '../../database-models';
import { GeneralBet } from '../../models';


export default function Hub() {
  const [bets, setBets] = useState<any>(null);
  const [expenses, setExpenses] = useState<any>(null);

  useEffect(() => {
    (async function() {
      try {
        const requestResult = await axios.get("http://213.91.236.205:5000/GetAllBets");
        const allBets: Array<GeneralBet> = requestResult.data.map((bet: Bet) => {
          return {
            ...bet,
            dateCreated: new Date(bet.dateCreated),
            dateFinished: new Date(bet.dateFinished),
            dateStaked: new Date(bet.dateStaked),
            savedInDatabase: true,
            canceled: false,
            isChild: false,
          };
        });
        
        setBets(allBets);

        let allExpenses: Array<Expense> = [
          {
            id: 1,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 2,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 3,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 4,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 5,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 6,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 7,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 8,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 9,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 10,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 11,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 12,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 13,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 14,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 15,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 16,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 17,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 18,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 19,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 20,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 21,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 22,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 23,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 24,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },
          {
            id: 25,
            counteragentId: 3,
            counteragent: null,
            description: "Description 1",
            dateFrom: new Date("2023-05-08T01:37:55.139343Z"),
            dateTo: new Date("2023-05-08T01:37:55.139371Z"),
            dateCreated: new Date("2023-05-08T01:37:55.139399Z"),
            amount: 0
          },  
        ];

        setExpenses(allExpenses);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const statsColumns: GridColDef[] = [
    {
      field: 'id',
    },
    { 
      field: 'period', 
      headerName: 'Period', 
      width: 500 
    },
    {
      field: 'pl',
      headerName: 'P/L',
      width: 110,
      editable: true,
    },
    {
      field: 'winRate',
      headerName: 'Win Rate',
      width: 110,
      editable: true,
    },
    {
      field: 'yield',
      headerName: 'Yield',
      type: 'number',
      width: 110,
      editable: true,
    },
    {
      field: 'turnover',
      headerName: 'Turnover',
      type: 'number',
      width: 110,
      editable: true,
    },
    {
      field: 'profit',
      headerName: 'Profit',
      type: 'number',
      width: 110,
      editable: true,
    },
  ];
  
  const statsRows = [
    { 
      id: 1, 
      period: "results by chosen date of the calendar initially the current day",  
      pl: "", 
      winRate: "", 
      yield: "", 
      turnover: "", 
      profit: "", 
    },
    { 
      id: 2, 
      period: "3m till today(included or excluded?)",  
      pl: "", 
      winRate: "", 
      yield: "", 
      turnover: "", 
      profit: "", 
    },
    { 
      id: 3, 
      period: "6m till today(included or excluded?)",  
      pl: "", 
      winRate: "", 
      yield: "", 
      turnover: "", 
      profit: "", 
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
      type: 'date',
    },
    // TODO: counter agent name??
    { 
      field: 'counteragentId', 
      headerName: 'Couter agent', 
      editable: true,
      width: 100,
      type: 'string',
    },
    { 
      field: 'sport', 
      headerName: 'Sport',
      editable: true, 
      width: 100,
      type: 'number',
    },
    //TODO: market name?
    { 
      field: 'marketId', 
      headerName: 'Market',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: 'stakeValue', 
      headerName: 'Stake',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: 'liveStatus', 
      headerName: 'PRE/LIVE',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: 'psLimit', 
      headerName: 'PS Limit',
      editable: true, 
      width: 100,
      type: 'number',
    },
    // TODO: tournament name??
    { 
      field: 'tournamentId', 
      headerName: 'Tournament',
      editable: true, 
      width: 100,
      type: 'number',
    },
    // TODO: selection name??
    { 
      field: 'selectionId', 
      headerName: 'Selection',
      editable: true, 
      width: 100,
      type: 'number',
    },
    // TODO: currency calculated due to currency?? 
    { 
      field: 'amount', 
      headerName: 'BGN',
      editable: true, 
      width: 100,
      type: 'number',
    },
    // TODO: currency calculated due to currency??
    // { 
    //   field: 'amount', 
    //   headerName: 'USD',
    //   editable: true, 
    //   width: 100,
    //   type: 'number',
    // },
    // TODO: currency calculated due to currency??
    // { 
    //   field: 'amount', 
    //   headerName: 'EUR',
    //   editable: true, 
    //   width: 100,
    //   type: 'number',
    // },
    // TODO: currency calculated due to currency??
    // { 
    //   field: 'amount', 
    //   headerName: 'BGP',
    //   editable: true, 
    //   width: 100,
    //   type: 'number',
    // },
    // { 
    //   field: 'amount', 
    //   headerName: 'Amount',
    //   editable: true, 
    //   width: 100,
    //   type: 'number',
    // },
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
      type: 'date',
    },
    // Mapping with...??
    // { 
    //   field: '', 
    //   headerName: 'Expense applied',
    //   editable: true, 
    //   width: 100,
    //   type: '',
    // },
    // Mapping with...??
    // { 
    //   field: '', 
    //   headerName: 'W/L (Brut PLN)',
    //   editable: true, 
    //   width: 100,
    //   type: '',
    // },
    // Mapping with...??
    // { 
    //   field: '', 
    //   headerName: 'NET PLN',
    //   editable: true, 
    //   width: 100,
    //   type: '',
    // },
    { 
      field: 'totalAmount', 
      headerName: 'Volume',
      editable: true, 
      width: 100,
      type: 'number',
    },
  ];
  const betsData: GridRowsProp = bets;

  const expenseColumns: Array<GridColDef> = [
    {
      field: 'id',
    },
    // TODO: counter agent name??
    { 
      field: 'counteragentId', 
      headerName: 'Counteragent', 
      editable: true,
      width: 100,
      type: 'number',
    },
    // TODO: category name of counter agent??
    { 
      field: 'counteragent.counteragentCategory.name', 
      headerName: 'Category of counteragent', 
      editable: true,
      width: 100,
      type: 'string',
    },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      editable: true,
      width: 100,
      type: 'number',
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      editable: true,
      width: 100,
      type: 'string',
    },
    // Period as a number of days in between dateFrom and dateTo??
    { 
      field: 'dateTo', 
      headerName: 'Pediod of payment', 
      editable: true,
      width: 100,
      type: 'date',
    },
    { 
      field: 'counteragent.user.userName', 
      headerName: 'User(only for GA)', 
      editable: true,
      width: 100,
      type: 'string',
    },
  ];

  const expenseData: GridRowsProp = expenses;

  return (
    <Paper sx={{ padding: '5%', }}>
      {
        betsData 
          ? (
              <>
                <Typography variant="h4">PENDING</Typography>
                <FullFeaturedCrudGrid  columns={betsColumns} initialRows={betsData.slice(0, 3)}/>
                {/* <Typography variant="h4">COMPLETED</Typography>
                <FullFeaturedCrudGrid  columns={betsColumns} initialRows={betsData}/> */}
              </>
            )
          : null
      }
      {/* {
        expenses 
          ? (
              <>
                <Typography variant="h4">EXPENSES</Typography>
                <FullFeaturedCrudGrid  columns={expenseColumns} initialRows={expenseData}/>
              </>
            )
          : null
      } */}
    </Paper>
  );
}
