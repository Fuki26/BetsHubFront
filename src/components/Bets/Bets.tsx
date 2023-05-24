import { useEffect, } from 'react';
import * as React from 'react';
import { toast } from 'react-toastify';
import { DataGridPro, GridActionsCellItem, GridCellParams, GridColDef,
  GridRenderCellParams,
  GridRenderEditCellParams, GridRowId, GridRowModel, GridRowModes, 
  GridRowModesModel, GridRowParams, GridRowsProp, GridToolbarContainer, GridTreeNode, GridValidRowModel, GridValueSetterParams, } from "@mui/x-data-grid-pro";
import { Button, Dialog, DialogActions, DialogTitle, Paper, Autocomplete, TextField, Stack, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import CancelIcon from '@mui/icons-material/Close';
import { Bet, } from '../../database-models';
import { BetModel } from '../../models';
import { ActionType, BetStatus, PreliveLiveStatus } from '../../models/enums';
import FreeSoloCreateOption from '../Dropdown/FreeSoloCreateOptionDialog';
import { getPendingBets, getCounteragents, getSports, getTournaments,
  getMarkets, getSelections, deleteBet, upsertBet, } from '../../api';

export enum ItemTypes {
  COUNTERAGENT = 'COUNTERAGENT',
  SPORT = 'SPORT',
  MARKET = 'MARKET',
  TOURNAMENT = 'TOURNAMENT',
  SELECTION = 'SELECTION',
};

interface ISelectionsResult {
    [key: string]: Array<string>;
}

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
        betStatus: 0,
        stake: undefined,
        counteragentId: undefined,
        counteragent: undefined,
        sport:	undefined,
        liveStatus:	0,
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
        isSavedInDatabase: false,
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

export default function Bets(props: { completed: boolean; selectedBetFn: (selectedBet: BetModel) => void; }) {
  const [ rows, setRows] = React.useState<Array<BetModel> | null>(null);
  const [ rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const [ deleteRowId, setDeleteRowId ] = React.useState<number | null>(null);
  const [ deleteDialogIsOpened, setOpenDeleteDialog] = React.useState(false);

  const [ possibleCounteragents, setCounteragents ] = React.useState<Array<{ id: number; name: string; }> | null>(null);
  const [ possibleSports, setSports ] = React.useState<Array<string> | null>(null);
  const [ possibleTournaments, setTournaments ] = React.useState<Array<string> | null>(null);
  const [ possibleMarkets, setMarkets ] = React.useState<Array<string> | null>(null);
  const [ possibleSelections, setSelections ] = React.useState<ISelectionsResult | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const getAllBetsResult = await getPendingBets();
        const allBets: Array<BetModel> = getAllBetsResult!.map((bet: Bet) => {
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
        });
        const getAllCounteragentsResult = await getCounteragents();
        const getAllSportsResult = await getSports();
        const getAllMarketsResult = await getMarkets();
        const getAllTournamentsResult = await getTournaments();
        const getAllSelectionsResult = await getSelections();

        const counterAgents: Array<{ id: number; name: string; }> | undefined = getAllCounteragentsResult?.map((counteragent) => {
          return {
            id: counteragent.id,
            name: counteragent.name,
          };
        });

        setRows(allBets);

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

  //#region Delete dialog

  const handleClickOpenOnDeleteDialog = (id: GridRowId) => () => {
    setDeleteRowId(parseInt(id.toString(), 10));
    setOpenDeleteDialog(true);
  };
  
  const handleCloseOnDeleteDialog = () => {
    setDeleteRowId(null);
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
    const canceledRow = rows?.find((r) => r.id === id);
    if(!canceledRow?.isSavedInDatabase) {
      setRows((previousRowsModel) => {
        return previousRowsModel!.filter((row) => {
          return row.id !== id;
        });
      });
    } else {
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
      });
    }
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

  const handleDeleteClick = async () => {
    if(!deleteRowId) {
      return;
    }

    // await deleteBet({ id: deleteRowId, });
      setDeleteRowId(null);
      setOpenDeleteDialog(false);

      setRows((previousRows) => previousRows!.filter((row) => row.id !== deleteRowId));
      setRowModesModel((previousRowModesModel) => {
        return { ...previousRowModesModel, [deleteRowId]: { mode: GridRowModes.View } };
      });
  };

  const handleCopyBetClick = (id: GridRowId) => () => {
    const clickedRow = rows?.find((row) => row.id === id);
    const randomId: number = Math.round(Math.random() * 1000000);

    setRows((oldRows) => {
      return [
        ...oldRows!,
        { 
          id: randomId,
          dateCreated: clickedRow?.dateCreated,
          betStatus: clickedRow?.betStatus,
          stake: clickedRow?.stake,
          counteragentId: clickedRow?.counteragentId,
          counteragent: clickedRow?.counteragent,
          sport:	clickedRow?.sport,
          liveStatus:	clickedRow?.liveStatus,
          psLimit: clickedRow?.psLimit,
          market: clickedRow?.market,
          tournament: clickedRow?.tournament,
          selection: clickedRow?.selection,
          amountBGN: undefined,
          amountEUR: undefined,
          amountUSD: undefined,
          amountGBP: undefined,
          totalAmount: undefined,
          odd: undefined,
          dateFinished: clickedRow?.dateFinished,
          dateStaked: clickedRow?.dateStaked,
          profits: clickedRow?.profits,
          notes: clickedRow?.notes,
      
          actionTypeApplied: undefined,
          isSavedInDatabase: false,
        } as BetModel
      ]
    });
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [randomId]: { mode: GridRowModes.Edit, },
    }));
  };

  const onRowClick = (params: GridRowParams) => {
    const row = rows!.find((row) => row.id === params.id);
    if(row) {
      setRowModesModel((previousRowModesModel) => {
        return { ...previousRowModesModel, [row.id]: { mode: GridRowModes.Edit } }
      });
    } else {

    }
  }

  //#endregion Actions handlers

  //#region Rows update handler

  const processRowUpdate = async (newRow: GridRowModel) => {
    const currentRow = rows?.find((row) => row.id === newRow.id);
    
    toast(currentRow?.actionTypeApplied === ActionType.CANCELED 
        ? 'Canceled' 
        : `Saved bet with id ${currentRow!.id}`,
      {
        position: 'top-center',
      });
    if(currentRow?.actionTypeApplied === ActionType.SAVED
        || currentRow?.actionTypeApplied === ActionType.EDITED) {
          const newRowData: BetModel = {
            ...currentRow,
            dateCreated: newRow.dateCreated,
            betStatus: newRow.betStatus,
            stake: newRow.stake,
            counteragentId: newRow.counteragentId,
            counteragent: currentRow.counteragent,
            sport:	currentRow.sport,
            liveStatus:	newRow.liveStatus,
            psLimit: newRow.psLimit,
            market: currentRow.market,
            tournament: currentRow.tournament,
            selection: currentRow.selection,
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

          alert(`newRowData = ${JSON.stringify(newRowData)}`);
          await upsertBet(newRowData);

          setRows((previousRowsModel) => {
            return previousRowsModel!.map((row) => {
              if(row.id === newRow.id) {
                return newRowData;
              } else {
                return row;
              }
            });
          });
    } else {

    }
    
    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [newRow.id]: { mode: GridRowModes.View } }
    });

    return newRow;
  };

  //#endregion Rows update handler
  
  //#region Dropdown handlers

  const onClick = (props: { betId: number; }) => {
    const { betId, } = props;

    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [betId]: { mode: GridRowModes.Edit } }
    });
  }

  const onChangeCb = (props: { betId?: number; itemType: ItemTypes; 
    id?: string; label: string; }): void => {
    const { betId, itemType, id, label, } = props;
    setRows((previousRowsModel) => {
      return previousRowsModel!.map((row) => {
        if(row.id === betId) {
          switch(itemType) {
            case ItemTypes.COUNTERAGENT: {
              const counteragent = possibleCounteragents?.find((c: { id: number; name: string; }) => {
                return parseInt(id!) === c.id;
              });

              return {
                ...row, 
                counteragentId: counteragent?.id,
                counteragent: counteragent?.name,
              };
            };
            case ItemTypes.SPORT: {
              return {
                ...row, 
                sport: label,
              };
            };
            case ItemTypes.MARKET: {
              return {
                ...row, 
                market: label,
              };
            };
            case ItemTypes.TOURNAMENT: {
              return {
                ...row, 
                tournament: label,
              };
            };
            case ItemTypes.SELECTION: {
              return {
                ...row, 
                selection: label,
              };
            };
          }
        }
          
        return row;
      });
    });
  }

  const onAddNewValueCb = (props: { betId?: number; itemType: ItemTypes; inputValue: string; }): void => {
    const { betId, itemType, inputValue, } = props;
  }

  const onCounteragentRender = (params: GridValidRowModel) => {
    const row = rows?.find((r) => r.id === params.id);
    if(!row || !row.counteragentId || !row.counteragent) {
      return;
    }

    return (
      <>
        <FreeSoloCreateOption 
          betId={params.id}
          defaultValue={
            {
              id: row.counteragentId.toString(),
              label: row.counteragent,
              inputValue: '',
            }
          }
          items={
            possibleCounteragents && possibleCounteragents.length > 0
              ? possibleCounteragents.map((counteragent: { id: number; name: string; }) => {
                  return {
                    id: counteragent.id.toString(),
                    label: counteragent.name,
                    inputValue: '', 
                  };
                })
              : []
          }
          // defaultValue={{ id: row.counteragentId.toString(), label: row.counteragent, inputValue: ''}}
          itemType={ItemTypes.COUNTERAGENT}
          onChangeCb={onChangeCb}
          onAddNewValueCb={onAddNewValueCb}
          onClick={onClick}
        />
      </>
    );
  }

  const onSportRender = (params: GridValidRowModel) => {
    const row = rows?.find((r) => r.id === params.id);
    if(!row || !row.sport) {
      return;
    }

    return (
      <>
        <FreeSoloCreateOption 
          betId={params.id}
          items={
            possibleSports && possibleSports.length > 0
              ? possibleSports.map((sport: string) => {
                  return {
                    id: sport,
                    label: sport,
                    inputValue: '', 
                  };
                })
              : []
          }
          defaultValue={{ id: row.sport, label: row.sport, inputValue: ''}}
          itemType={ItemTypes.SPORT}
          onChangeCb={onChangeCb}
          onAddNewValueCb={onAddNewValueCb}
          onClick={onClick}
        />
      </>
    );
  }

  const onMarketRender = (params: GridValidRowModel) => {
    const row = rows?.find((r) => r.id === params.id);
    if(!row || !row.market) {
      return;
    }

    return (
      <>
        <FreeSoloCreateOption 
          betId={params.id}
          items={
            possibleMarkets && possibleMarkets.length > 0
              ? possibleMarkets.map((market: string) => {
                  return {
                    id: market,
                    label: market,
                    inputValue: '', 
                  };
                })
              : []
          }
          defaultValue={{ id: row.market, label: row.market, inputValue: ''}}
          itemType={ItemTypes.MARKET}
          onChangeCb={onChangeCb}
          onAddNewValueCb={onAddNewValueCb}
          onClick={onClick}
        />
      </>
    );
  }

  const onTournamentRender = (params: GridValidRowModel) => {
    const row = rows?.find((r) => r.id === params.id);
    if(!row || !row.tournament) {
      return;
    }

    return (
      <>
        <FreeSoloCreateOption 
          betId={params.id}
          items={
            possibleTournaments && possibleTournaments.length > 0
              ? possibleTournaments.map((tournament: string) => {
                  return {
                    id: tournament,
                    label: tournament,
                    inputValue: '', 
                  };
                })
              : []
          }
          defaultValue={{ id: row.tournament, label: row.tournament, inputValue: ''}}
          itemType={ItemTypes.TOURNAMENT}
          onChangeCb={onChangeCb}
          onAddNewValueCb={onAddNewValueCb}
          onClick={onClick}
        />
      </>
    );
  }

  //#endreigon Dropdown handlers

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
    },
    {
      field: 'betStatus',
      headerName: 'Bet status',
      type: 'number',
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
      type: 'singleSelect',
      editable: true,
      width: 300,
      renderCell: onCounteragentRender,
      renderEditCell: onCounteragentRender,
    },
    {
      field: 'sport',
      headerName: 'Sport',
      type: 'singleSelect',
      editable: true,
      width: 300,
      renderCell: onSportRender,
      renderEditCell: onSportRender,
    },
    {
      field: 'liveStatus',
      headerName: 'Live status',
      type: 'number',
      editable: true,
      width: 150,
    },
    {
      field: 'psLimit',
      headerName: 'PS Limit',
      type: 'number',
      editable: true,
      width: 150,
    },
    {
      field: 'market',
      headerName: 'Market',
      type: 'singleSelect',
      editable: true,
      width: 300,
      renderCell: onMarketRender,
      renderEditCell: onMarketRender,
    },
    {
      field: 'tournament',
      headerName: 'Tournament',
      type: 'singleSelect',
      editable: true,
      width: 300,
      renderCell: onTournamentRender,
      renderEditCell: onTournamentRender,
    },
    {
      field: 'selection',
      headerName: 'Selection',
      type: 'singleSelect',
      editable: true,
      width: 300,
      renderEditCell: (params: GridRenderEditCellParams) => {
        const selections = possibleSelections
          ? possibleSelections[params.row.counteragentId]
              ? possibleSelections[params.row.counteragentId]
              : []
          : [];

        return (
          <>
            <FreeSoloCreateOption
              betId={params.row.id}
              defaultValue={null}
              items={
                selections && selections.length > 0
                  ? selections.map((selection: string) => {
                      return {
                        id: selection,
                        label: selection,
                        inputValue: '', 
                      };
                    })
                  : []
              }
              itemType={ItemTypes.SELECTION}
              onChangeCb={onChangeCb}
              onAddNewValueCb={onAddNewValueCb} 
            />
          </>
        )
      },
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
      headerName: 'Total amount',
      type: 'number',
      editable: true,
      width: 150,
      valueSetter: (params: GridValueSetterParams) => {
        const totalAmount = params.row.amountBGN 
          + params.row.amountEUR 
          + params.row.amountUSD 
          + params.row.amountGBP;
        return { ...params.row, totalAmount, };
      },
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
              <GridActionsCellItem
                icon={<AddIcon />}
                label="Copy bet"
                onClick={handleCopyBetClick(params.id)}
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
                  onRowClick={onRowClick}
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
  