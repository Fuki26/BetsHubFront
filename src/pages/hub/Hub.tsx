import { useEffect, useState } from 'react';
import { DataGridPro, GridColDef, } from '@mui/x-data-grid-pro';
import { Bet } from '../../models/Bet';
import { Box } from '@mui/material';

export const Hub = () => {
  const [bets, setBets] = useState<any>(null);
  useEffect(() => {
    (async function() {
      try {
        // const headers = {
        //   "Accept": "*/*",
        //   "Accept-Encoding": "gzip, deflate, br",
        //   "Connection": "keep-alive",
        // };
  
        // let config = {
        //   method: 'get',
        //   maxBodyLength: Infinity,
        //   url: 'https://213.91.236.205:5000/GetAllBets',
        //   headers,
        // };
        
        // axios.request(config)
        //   .then((response) => {
        //     console.log(JSON.stringify(response.data));
        //   })
        //   .catch((error) => {
        //     console.log(error);
        //   });
  
        let allBets: Array<Bet> = [];
  
        setBets(allBets);
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
      headerName: 'Period', 
      editable: true,
      width: 100 
    },
    { 
      field: 'couteragent', 
      headerName: 'Couteragent', 
      editable: true,
      width: 100 
    },
    { 
      field: 'sport', 
      headerName: 'Sport',
      editable: true, 
      width: 100 
    },
    { 
      field: 'market', 
      headerName: 'Market',
      editable: true, 
      width: 100 
    },
    { 
      field: 'stakeValue', 
      headerName: 'Stake',
      editable: true, 
      width: 100 
    },
    { 
      field: 'prelive', 
      headerName: 'PRE/LIVE', 
      editable: true,
      width: 100 
    },
    { 
      field: 'psLimit', 
      headerName: 'Ps Limit',
      editable: true, 
      width: 100 
    },
    { 
      field: 'tournament', 
      headerName: 'Tournament', 
      editable: true,
      width: 100 
    },
    { 
      field: 'selection', 
      headerName: 'Selection', 
      editable: true,
      width: 100 
    },
    { 
      field: 'bgn', 
      headerName: 'BGN',
      editable: true, 
      width: 100 
    },
    { 
      field: 'usd', 
      headerName: 'USD', 
      editable: true,
      width: 100 
    },
    { 
      field: 'eur', 
      headerName: 'EUR', 
      width: 100 
    },
    { 
      field: 'bgp', 
      headerName: 'BGP', 
      editable: true,
      width: 100 
    },
    { 
      field: 'amount', 
      headerName: 'Amount',
      editable: true, 
      width: 100 
    },
    { 
      field: 'odd', 
      headerName: 'ODD', 
      editable: true,
      width: 100 
    },
    { 
      field: 'dateFinished', 
      headerName: 'Date finished', 
      editable: true,
      width: 100 
    },
    { 
      field: 'expenseApplied', 
      headerName: 'Expense applied',
      editable: true, 
      width: 100 
    },
    { 
      field: 'wl', 
      headerName: 'W/L (Brut PLN)', 
      editable: true,
      width: 100 
    },
    { 
      field: 'netPln', 
      headerName: 'NET PLN',
      editable: true, 
      width: 100 
    },
    { 
      field: 'volumr', 
      headerName: 'Volumr', 
      editable: true,
      width: 100 
    },
    { 
      field: 'pl', 
      headerName: 'PL', 
      editable: true,
      width: 100 
    },
  ];

  const betsData: Array<Bet> = [
    {
      id: 1,
      dateCreated: new Date("2024-01-21T11:11:11.111111Z"),
      counteragentId: 1,
      counteragent: null,
      sport: 1,
      liveStatus: 1,
      psLimit: 1,
      marketId: 1,
      market: null,
      stakeValue: 1,
      tournamentId: 1,
      tournament: null,
      selectionId: 1,
      selection: null,
      amount: 1,
      odd: 1,
      dateFinished: new Date("2024-01-21T11:11:11.111111Z"),
      dateStaked: new Date("2024-01-21T11:11:11.111111Z"),
      profits: 10,
      notes: "Notes 10"
    },
    {
      id: 2,
      dateCreated: new Date("2024-02-22T11:12:12.111111Z"),
      counteragentId: 2,
      counteragent: null,
      sport: 2,
      liveStatus: 2,
      psLimit: 2,
      marketId: 2,
      market: null,
      stakeValue: 2,
      tournamentId: 2,
      tournament: null,
      selectionId: 2,
      selection: null,
      amount: 2,
      odd: 2,
      dateFinished: new Date("2024-01-22T11:12:12.111111Z"),
      dateStaked: new Date("2024-01-22T11:12:12.111111Z"),
      profits: 20,
      notes: "Notes 20"
    },
    {
      id: 3,
      dateCreated: new Date("2024-02-23T11:13:13.111111Z"),
      counteragentId: 3,
      counteragent: null,
      sport: 3,
      liveStatus: 3,
      psLimit: 3,
      marketId: 3,
      market: null,
      stakeValue: 3,
      tournamentId: 3,
      tournament: null,
      selectionId: 3,
      selection: null,
      amount: 3,
      odd: 3,
      dateFinished: new Date("2024-01-23T11:13:13.111111Z"),
      dateStaked: new Date("2024-01-23T11:13:13.111111Z"),
      profits: 30,
      notes: "Notes 30"
    },
    {
      id: 4,
      dateCreated: new Date("2024-02-24T11:14:14.111111Z"),
      counteragentId: 4,
      counteragent: null,
      sport: 4,
      liveStatus: 4,
      psLimit: 4,
      marketId: 4,
      market: null,
      stakeValue: 4,
      tournamentId: 4,
      tournament: null,
      selectionId: 4,
      selection: null,
      amount: 4,
      odd: 4,
      dateFinished: new Date("2024-01-24T11:14:14.111111Z"),
      dateStaked: new Date("2024-01-24T11:14:14.111111Z"),
      profits: 40,
      notes: "Notes 40"
    },
    {
      id: 5,
      dateCreated: new Date("2024-02-25T11:15:15.111111Z"),
      counteragentId: 5,
      counteragent: null,
      sport: 5,
      liveStatus: 5,
      psLimit: 5,
      marketId: 5,
      market: null,
      stakeValue: 5,
      tournamentId: 5,
      tournament: null,
      selectionId: 5,
      selection: null,
      amount: 5,
      odd: 5,
      dateFinished: new Date("2024-01-25T11:15:15.111111Z"),
      dateStaked: new Date("2024-01-25T11:15:15.111111Z"),
      profits: 50,
      notes: "Notes 50"
    },
    {
      id: 6,
      dateCreated: new Date("2024-02-26T11:16:16.111111Z"),
      counteragentId: 6,
      counteragent: null,
      sport: 6,
      liveStatus: 6,
      psLimit: 6,
      marketId: 6,
      market: null,
      stakeValue: 6,
      tournamentId: 6,
      tournament: null,
      selectionId: 6,
      selection: null,
      amount: 6,
      odd: 6,
      dateFinished: new Date("2024-01-26T11:16:16.111111Z"),
      dateStaked: new Date("2024-01-26T11:16:16.111111Z"),
      profits: 60,
      notes: "Notes 60"
    },
  ];

  return (
    <div>
      <h3>Stats</h3>
      <Box sx={{ height: 400, width: '100%', marginBottom: '100px' }}>
        <DataGridPro
          rows={statsRows}
          columns={statsColumns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
            columns: {
              columnVisibilityModel: {
                id: false,
              },
            }
          }}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
      <h3>Pending</h3>
      <Box sx={{ height: 400, width: '100%', marginBottom: '100px' }}>
        <DataGridPro
          columns={betsColumns}
          editMode="row"
          rows={betsData}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
            columns: {
              columnVisibilityModel: {
                id: false,
              },
            }
          }}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
      <h3>Completed</h3>
      <Box sx={{ height: 400, width: '100%', marginBottom: '100px' }}>
        <DataGridPro
          columns={betsColumns}
          rows={betsData}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
            columns: {
              columnVisibilityModel: {
                id: false,
              },
            }
          }}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  );
}
