import { useEffect, useState } from 'react';
import axios from 'axios';
import { GridColDef, GridRowsProp, } from '@mui/x-data-grid-pro';
import { Paper, Typography} from '@mui/material';
import { FullFeaturedCrudGrid } from '../search'; 
import { Bet, } from '../../database-models';
import { GeneralBet } from '../../models';


export default function Hub() {
  const [bets, setBets] = useState<Array<GeneralBet> | null>(null);

  useEffect(() => {
    (async function() {
      try {
        const getAllBetsResult = await axios.get("http://213.91.236.205:5000/GetAllBets");
        const allBets: Array<GeneralBet> = getAllBetsResult.data.map((bet: Bet) => {
          return {
            ...bet,
            dateCreated: new Date(bet.dateCreated),
            dateFinished: new Date(bet.dateFinished),
            dateStaked: new Date(bet.dateStaked),
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
      type: 'string',
    },
    { 
      field: 'sport', 
      headerName: 'Sport',
      editable: true, 
      width: 100,
      type: 'string',
    },
    { 
      field: 'market', 
      headerName: 'Market',
      editable: true, 
      width: 100,
      type: 'string',
    },
    { 
      field: 'stake', 
      headerName: 'Stake',
      editable: true, 
      width: 100,
      type: 'string',
    },
    { 
      field: 'liveStatus', 
      headerName: 'PRE/LIVE',
      editable: true, 
      width: 100,
      type: 'string',
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
      type: 'string',
    },
    { 
      field: 'selection', 
      headerName: 'Selection',
      editable: true, 
      width: 100,
      type: 'string',
    },
    { 
      field: '', 
      headerName: 'BGN',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: '', 
      headerName: 'USD',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: '', 
      headerName: 'EUR',
      editable: true, 
      width: 100,
      type: 'number',
    },
    { 
      field: '', 
      headerName: 'BGP',
      editable: true, 
      width: 100,
      type: 'number',
    },
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
  ];
  const betsData: Array<GeneralBet> | null = bets ? bets : null;

  return (
    <Paper sx={{ padding: '5%', }}>
      {
        betsData 
          ? (
              <>
                <Typography variant="h4">PENDING</Typography>
                <FullFeaturedCrudGrid<GeneralBet>  columns={betsColumns} initialRows={betsData.slice(0, 1)}/>
              </>
            )
          : null
      }
    </Paper>
  );
}
