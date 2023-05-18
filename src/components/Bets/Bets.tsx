import { useEffect, } from 'react';
import * as React from 'react';
import { toast } from 'react-toastify';
import { DataGridPro, GridActionsCellItem, GridColDef,
  GridRenderEditCellParams,
  GridRowId, GridRowModel, GridRowModes, GridRowModesModel, 
  GridRowsProp, GridToolbarContainer } from "@mui/x-data-grid-pro";
import axios from "axios";
import { Button, Dialog, DialogActions, DialogTitle, Paper } from '@mui/material';
import { Autocomplete } from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import CancelIcon from '@mui/icons-material/Close';
import { Bet, Counteragent, Market, Sport, Tournament } from '../../database-models';
import { BetModel } from '../../models';
import { ActionType, BetStatus, PreliveLiveStatus } from '../../models/enums';

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
  ) => void;
}

function EditToolbar(props: EditToolbarProps) {
  const { setRows, setRowModesModel } = props;

  const handleAddNewClick = () => {
    const id = Math.round(Math.random() * 1000000);
    setRows((oldRows) => [...oldRows, 
      { 
        id,
        dateCreated: new Date(),
        betStatus: BetStatus[0],
        stake: undefined,
        counteragentId: undefined,
        counteragent: undefined,
        sport:	undefined,
        liveStatus:	PreliveLiveStatus[0],
        psLimit: undefined,
        market: undefined,
        tournament: undefined,
        selection: undefined,
        amountBGN: undefined,
        amountEUR: undefined,
        amountUSD: undefined,
        amountGBP: undefined,
        totalAmount: undefined,
        odd: undefined,
        dateFinished: undefined,
        dateStaked: undefined,
        profits: undefined,
        notes: undefined,
    
        actionTypeApplied: undefined,
        isSavedInDatabase: true,
      } as BetModel
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" variant="contained" startIcon={<AddIcon />} onClick={handleAddNewClick}>
        Create a bet
      </Button>
    </GridToolbarContainer>
  );
}

export default function Bets(props: { completed: boolean; }) {
  const { completed, } = props;
  const [rows, setRows] = React.useState<Array<BetModel> | null>(null);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const [ deleteRowId, setDeleteRowId ] = React.useState<string | number | null>(null);
  const [ deleteDialogIsOpened, setOpenDeleteDialog] = React.useState(false);

  const [possibleCounteragents, setCounteragents] = React.useState<Array<Counteragent> | null>(null);
  const [possibleSports, setSports] = React.useState<Array<Sport> | null>(null);
  const [possibleTournaments, setTournaments] = React.useState<Array<Tournament> | null>(null);
  const [possibleMarkets, setMarkets] = React.useState<Array<Market> | null>(null);
  const [possibleSelections, setSelections] = React.useState<Array<Selection> | null>(null);


  useEffect(() => {
    (async () => {
      try {
        const getAllBetsResult = await axios.get(`http://213.91.236.205:5000/GetAllBets?StartIndex=0&Count=2&BetStatus=${!completed ? 0 :  1}`);
        const allBets: Array<BetModel> 
          = getAllBetsResult.data.map((bet: Bet) => {
          return {
            id: bet.id,
            dateCreated: new Date(bet.dateCreated),
            betStatus: BetStatus[bet.betStatus],
            stake: bet.stake,
            counteragentId: bet.counteragentId,
            counteragent: bet.counteragent
              ? bet.counteragent.name
              : '',
            sport:	bet.sport,
            liveStatus:	PreliveLiveStatus[bet.liveStatus], 
            psLimit: bet.psLimit,
            market: bet.market,
            tournament: bet.tournament,
            selection: bet.selection,
            amountBGN: bet.amountBGN,
            amountEUR: bet.amountEUR,
            amountUSD: bet.amountUSD,
            amountGBP: bet.amountGBP,
            totalAmount: bet.totalAmount,
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
        });
        
        setRows(allBets);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  //#region Delete dialog

  const handleClickOpenOnDeleteDialog = (id: GridRowId) => () => {
    setDeleteRowId(id);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseOnDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  //#endregion

  //#region Actions handlers

  const handleSaveClick = (id: GridRowId) => () => {
    setRows((previousRowsModel) => {
      return previousRowsModel!.map((row) => {
        if(row.id === id) {
          return {
            ...row, 
            actionTypeApplied: row.isSavedInDatabase 
              ? ActionType.EDITED
              : ActionType.SAVED,
          };
        } else {
          return row;
        }
      });
    });
    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [id]: { mode: GridRowModes.View } }
    })
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRows((previousRowsModel) => {
      return previousRowsModel!.map((row) => {
        if(row.id === id) {
          return {
            ...row, 
            actionTypeApplied: ActionType.CANCELED,
          };
        } else {
          return row;
        }
      });
    });
    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [id]: { mode: GridRowModes.View } }
    })
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRows((previousRowsModel) => {
      return previousRowsModel!.map((row) => {
        if(row.id === id) {
          return {
            ...row, 
            actionTypeApplied: ActionType.EDITED,
          };
        } else {
          return row;
        }
      });
    });
    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [id]: { mode: GridRowModes.Edit } }
    })
  };

  const handleDeleteClick = () => {
    if(!deleteRowId) {
      return;
    }

    setOpenDeleteDialog(false);

    setRows((previousRows) => previousRows!.filter((row) => row.id !== deleteRowId));
    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [deleteRowId]: { mode: GridRowModes.View } };
    });
};

  //#endregion Actions handlers

  //#region Rows update handler

  const processRowUpdate = (newRow: GridRowModel) => {
    const currentRow = rows?.find((row) => row.id === newRow.id);
    toast(currentRow?.actionTypeApplied === ActionType.CANCELED 
        ? 'Canceled' 
        : `Saved bet with id ${currentRow!.id}`,
      {
        position: 'top-center',
      });
    setRows((previousRowsModel) => {
      return previousRowsModel!.map((row) => {
        if(row.id === newRow.id) {
          return {
            ...row, 
            dateCreated: newRow.dateCreated,
            betStatus: newRow.betStatus,
            stake: newRow.stake,
            counteragent: newRow.counteragent,
            sport:	newRow.sport,
            liveStatus:	newRow.liveStatus,
            psLimit: newRow.psLimit,
            market: newRow.market,
            tournament: newRow.tournament,
            selection: newRow.selection,
            amountBGN: newRow.amountBGN,
            amountEUR: newRow.amountEUR,
            amountUSD: newRow.amountUSD,
            amountGBP: newRow.amountGBP,
            totalAmount: newRow.totalAmount,
            odd: newRow.odd,
            dateFinished: newRow.dateFinished,
            dateStaked: newRow.dateStaked,
            profits: newRow.profits,
            notes: newRow.notes,
          };
        } else {
          return row;
        }
      });
    });
    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [newRow.id]: { mode: GridRowModes.View } }
    });

    return newRow;
  };

  //#endregion Rows update handler
  
  const columns: Array<GridColDef> = [
    {
      field: 'id',
      type: 'number',
    },
    {
      field: 'dateCreated',
      headerName: 'Date created',
      type: 'date',
      editable: true,
      width: 150,
      renderEditCell: (params: GridRenderEditCellParams) => (
        <Autocomplete options={['Option 1', 'Option 2']} />
      ),
    },
    {
      field: 'betStatus',
      headerName: 'Bet status',
      type: 'string',
      editable: true,
      width: 150,
    },
    {
      field: 'stake',
      headerName: 'Stake',
      type: 'number',
      editable: true,
      width: 150,
    },
    {
      field: 'counteragent',
      headerName: 'Counteragent',
      type: 'string',
      editable: true,
      width: 150,
    },
    {
      field: 'sport',
      headerName: 'Sport',
      type: 'string',
      editable: true,
      width: 150,
    },
    {
      field: 'liveStatus',
      headerName: 'Live status',
      type: 'string',
      editable: true,
      width: 150,
    },
    {
      field: 'psLimit',
      headerName: 'Ps limit',
      type: 'number',
      editable: true,
      width: 150,
    },
    {
      field: 'market',
      headerName: 'Market',
      type: 'string',
      editable: true,
      width: 150,
    },
    {
      field: 'tournament',
      headerName: 'Tournament',
      type: 'string',
      editable: true,
      width: 150,
    },
    {
      field: 'selection',
      headerName: 'Selection',
      type: 'string',
      editable: true,
      width: 150,
    },
    {
      field: 'amountBGN',
      headerName: 'BGN',
      type: 'number',
      editable: true,
      width: 150,
    },
    {
      field: 'amountEUR',
      headerName: 'EUR',
      type: 'number',
      editable: true,
      width: 150,
    },
    {
      field: 'amountUSD',
      headerName: 'USD',
      type: 'number',
      editable: true,
      width: 150,
    },
    {
      field: 'amountGBP',
      headerName: 'GBP',
      type: 'number',
      editable: true,
      width: 150,
    },
    {
      field: 'totalAmount',
      headerName: 'Amount',
      type: 'number',
      editable: true,
      width: 150,
    },
    {
      field: 'odd',
      headerName: 'Odd',
      type: 'number',
      editable: true,
      width: 150,
    },
    {
      field: 'dateFinished',
      headerName: 'Date finished',
      type: 'date',
      editable: true,
      width: 150,
    },
    {
      field: 'dateStaked',
      headerName: 'Date staked',
      type: 'date',
      editable: true,
      width: 150,
    },
    {
      field: 'profits',
      headerName: 'Profits',
      type: 'number',
      editable: true,
      width: 150,
    },
    {
      field: 'notes',
      headerName: 'Notes',
      type: 'string',
      editable: true,
      width: 150,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 150,
      cellClassName: 'actions',
      getActions: (params) => {
        const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit;
        return isInEditMode 
          ? [
                <GridActionsCellItem
                  icon={<SaveIcon />}
                  label="Save"
                  onClick={handleSaveClick(params.id)}
                />,
                <GridActionsCellItem
                  icon={<CancelIcon />}
                  label="Cancel"
                  className="textPrimary"
                  onClick={handleCancelClick(params.id)}
                  color="inherit"
                />,
            ]
          : [
              <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                className="textPrimary"
                onClick={handleEditClick(params.id)}
                color="inherit"
              />,
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={handleClickOpenOnDeleteDialog(params.id)}
                color="inherit"
              />,
            ]
      },
    }
  ];

  return (
    <Paper sx={{ padding: '5%', }}>
      {
        rows
          ? (
              <>
                <DataGridPro
                  columns={columns}
                  rows={rows}   
                  slots={{
                    toolbar: EditToolbar,
                  }}
                  rowModesModel={rowModesModel}
                  processRowUpdate={processRowUpdate}
                  slotProps={{
                    toolbar: { setRows, setRowModesModel },
                  }}
                />
                <Dialog
                  open={deleteDialogIsOpened}
                  onClose={handleCloseOnDeleteDialog}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <DialogTitle id="alert-dialog-title">
                    {"Are you sure you want to delete the bet?"}
                  </DialogTitle>
                  <DialogActions>
                    <Button onClick={handleDeleteClick} autoFocus>Ok</Button>
                    <Button onClick={handleCloseOnDeleteDialog}>No</Button>
                  </DialogActions>
                </Dialog>
              </> 
            )
          : null
      }
    </Paper>
  );
}
  