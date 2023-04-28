import MaterialTable from 'material-table';
import { ThemeProvider, createTheme } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Bet } from '../../models/Bet';
import hubStyles from './Hub.module.css';

export const Hub = () => {
  const defaultMaterialTheme = createTheme();

  const [bets, setBets] = useState<any>(null);
  useEffect(() => {
    (async function() {
      try {
        const headers = {
          "Accept": "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
        };
  
        let config = {
          method: 'get',
          maxBodyLength: Infinity,
          url: 'https://213.91.236.205:5000/GetAllBets',
          headers,
        };
        
        axios.request(config)
          .then((response) => {
            console.log(JSON.stringify(response.data));
          })
          .catch((error) => {
            console.log(error);
          });
  
        let allBets: Array<Bet> = [
          {
            id: 50,
            dateCreated: new Date("2024-04-24T21:49:57.146082Z"),
            counteragentId: 21,
            counteragent: null,
            sport: 1,
            liveStatus: 1,
            psLimit: 2086275937,
            marketId: 21,
            market: null,
            stakeValue: 0.95,
            tournamentId: 21,
            tournament: null,
            selectionId: 21,
            selection: null,
            amount: 7,
            odd: 8,
            dateFinished: new Date("2024-04-24T21:49:57.146082Z"),
            dateStaked: new Date("2024-04-24T21:49:57.146082Z"),
            profits: 10,
            notes: "Notes 50"
          },
          {
            id: 51,
            dateCreated: new Date("2024-04-24T21:49:57.146082Z"),
            counteragentId: 22,
            counteragent: null,
            sport: 2,
            liveStatus: 2,
            psLimit: 2086275938,
            marketId: 22,
            market: null,
            stakeValue: 0.96,
            tournamentId: 22,
            tournament: null,
            selectionId: 22,
            selection: null,
            amount: 8,
            odd: 9,
            dateFinished: new Date("2024-04-24T21:49:57.146082Z"),
            dateStaked: new Date("2024-04-24T21:49:57.146082Z"),
            profits: 10,
            notes: "Notes 60"
          },
        ];
  
        setBets(allBets);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const allBets = bets;
  return (
    <div className={hubStyles.hubWrapper}>
      <h1>Hub</h1>
      <h3>Pending</h3>
      <div className={hubStyles.betsTableWrapper}>
        <ThemeProvider theme={defaultMaterialTheme}>
          <MaterialTable
            editable={{
              onRowAdd: newData =>
                new Promise((resolve, reject) => {
                }),
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve, reject) => {
                }),
              onRowDelete: oldData =>
                new Promise((resolve, reject) => {
                }),
            }}
            columns={[
              { title: 'Id', field: 'id', type: 'numeric' },
              { title: 'Date Created', field: 'dateCreated', type: 'date' },
              { title: 'Counteragent Id', field: 'counteragentId', type: 'numeric' },
              { title: 'Sport', field: 'sport', type: 'numeric' },
              { title: 'Live Status', field: 'liveStatus', type: 'numeric' },
              { title: 'Ps Limit', field: 'psLimit', type: 'numeric' },
              { title: 'Market Id', field: 'marketId', type: 'numeric' },
              { title: 'Stake Value', field: 'stakeValue', type: 'numeric' },
              { title: 'Tournament Id', field: 'tournamentId', type: 'numeric' },
              { title: 'Selection Id', field: 'selectionId', type: 'numeric' },
              { title: 'Amount', field: 'amount', type: 'numeric' },
              { title: 'Odd', field: 'odd', type: 'numeric' },
              { title: 'Date Finished', field: 'dateFinished', type: 'date' },
              { title: 'Date Staked', field: 'dateStaked', type: 'date' },
              { title: 'Profits', field: 'profits', type: 'numeric' },
              { title: 'Notes', field: 'notes', type: 'string' },
            ]}
            data={allBets}
            title="Bets"
          />
        </ThemeProvider>
      </div>

      <h3>Completed</h3>
      <div className={hubStyles.betsTableWrapper}>
        <ThemeProvider theme={defaultMaterialTheme}>
          <MaterialTable
            editable={{
              onRowAdd: newData =>
                new Promise((resolve, reject) => {
                }),
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve, reject) => {
                }),
              onRowDelete: oldData =>
                new Promise((resolve, reject) => {
                }),
            }}
            columns={[
              { title: 'Id', field: 'id', type: 'numeric' },
              { title: 'Date Created', field: 'dateCreated', type: 'date' },
              { title: 'Counteragent Id', field: 'counteragentId', type: 'numeric' },
              { title: 'Sport', field: 'sport', type: 'numeric' },
              { title: 'Live Status', field: 'liveStatus', type: 'numeric' },
              { title: 'Ps Limit', field: 'psLimit', type: 'numeric' },
              { title: 'Market Id', field: 'marketId', type: 'numeric' },
              { title: 'Stake Value', field: 'stakeValue', type: 'numeric' },
              { title: 'Tournament Id', field: 'tournamentId', type: 'numeric' },
              { title: 'Selection Id', field: 'selectionId', type: 'numeric' },
              { title: 'Amount', field: 'amount', type: 'numeric' },
              { title: 'Odd', field: 'odd', type: 'numeric' },
              { title: 'Date Finished', field: 'dateFinished', type: 'date' },
              { title: 'Date Staked', field: 'dateStaked', type: 'date' },
              { title: 'Profits', field: 'profits', type: 'numeric' },
              { title: 'Notes', field: 'notes', type: 'string' },
            ]}
            data={allBets}
            title="Bets"
          />
        </ThemeProvider>
      </div>

      <h3>Expenses</h3>
      <div className={hubStyles.betsTableWrapper}>
        <ThemeProvider theme={defaultMaterialTheme}>
          <MaterialTable
            editable={{
              onRowAdd: newData =>
                new Promise((resolve, reject) => {
                }),
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve, reject) => {
                }),
              onRowDelete: oldData =>
                new Promise((resolve, reject) => {
                }),
            }}
            columns={[
              { title: 'Id', field: 'id', type: 'numeric' },
              { title: 'Date Created', field: 'dateCreated', type: 'date' },
              { title: 'Counteragent Id', field: 'counteragentId', type: 'numeric' },
              { title: 'Sport', field: 'sport', type: 'numeric' },
              { title: 'Live Status', field: 'liveStatus', type: 'numeric' },
              { title: 'Ps Limit', field: 'psLimit', type: 'numeric' },
              { title: 'Market Id', field: 'marketId', type: 'numeric' },
              { title: 'Stake Value', field: 'stakeValue', type: 'numeric' },
              { title: 'Tournament Id', field: 'tournamentId', type: 'numeric' },
              { title: 'Selection Id', field: 'selectionId', type: 'numeric' },
              { title: 'Amount', field: 'amount', type: 'numeric' },
              { title: 'Odd', field: 'odd', type: 'numeric' },
              { title: 'Date Finished', field: 'dateFinished', type: 'date' },
              { title: 'Date Staked', field: 'dateStaked', type: 'date' },
              { title: 'Profits', field: 'profits', type: 'numeric' },
              { title: 'Notes', field: 'notes', type: 'string' },
            ]}
            data={allBets}
            title="Bets"
          />
        </ThemeProvider>
      </div>
    </div>
  );
}
