import * as React from 'react';
import { toast } from 'react-toastify';
import { DataGridPro, GridActionsCellItem, GridColDef,
  GridRenderCellParams,
  GridRenderEditCellParams,GridRowId, GridRowModel, GridRowModes, 
  GridRowModesModel, GridRowParams, GridToolbarContainer, GridValueSetterParams, MuiEvent, } from '@mui/x-data-grid-pro';
import { Autocomplete, Button, Dialog, DialogActions, DialogTitle, 
  Paper, TextField, Tooltip, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import CancelIcon from '@mui/icons-material/Close';
import { BetModel, EditToolbarProps, Enums, ISelectionsResult, } from '../../models';
import { deleteBet, upsertBet, getBetHistory } from '../../api';
import { BetStatus, WinStatus, ItemTypes, LiveStatus } from '../../models/enums';
import { Currency } from '../../database-models';
import { slideAnimationDuration } from '@mui/x-date-pickers/DateCalendar/PickersSlideTransition';
import Modal from '../UI/Modal';

export default function Bets(props: { 
  isRead: boolean;
  selectBetIdFn: (id: number) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;

  defaultRows: Array<BetModel> | undefined;
  currencies: Array<Currency> | undefined;
  possibleCounteragents: Array<{ value: string; label: string; }> | undefined;
  allSelections: ISelectionsResult;
  possibleSports: Array<{ value: string; label: string; }> | undefined;
  possibleTournaments: Array<{ value: string; label: string; }> | undefined;
  possibleMarkets: Array<{ value: string; label: string; }> | undefined;
}) {
  const { isRead, selectBetIdFn, setIsLoading, 
    defaultRows, currencies, possibleCounteragents, allSelections, 
    possibleSports, possibleTournaments, possibleMarkets,
  } = props;

  const [ rows, setRows, ] = React.useState<Array<BetModel> | undefined>(defaultRows);
  const [ rowModesModel, setRowModesModel, ] = React.useState<GridRowModesModel>({});
  const [ deleteRowId, setDeleteRowId, ] = React.useState<number | undefined>(undefined);
  const [ deleteDialogIsOpened, setOpenDeleteDialog, ] = React.useState(false);
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  const [history, setHistory] = React.useState(null);

  React.useEffect(() => {
    setRows((oldRows) => {
      return defaultRows;
    });

    setRowModesModel(() => {
      return {};
    });
  }, [ defaultRows, ]);

  function EditToolbar(props: EditToolbarProps) {
    const { setRows, setRowModesModel } = props;
  
    const handleAddNewClick = () => {
      const id = Math.round(Math.random() * 1000000);
      setRows((oldRows) => [...oldRows, 
        { 
          id,
          dateCreated: new Date(),
          betStatus: BetStatus.Pending,
          winStatus: WinStatus.None,
          stake: undefined,
          counteragentId: undefined,
          counteragent: undefined,
          sport:	undefined,
          liveStatus:	LiveStatus.PreLive,
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
  
    const isAnyRowInEditMode = rows?.some((r) => {
      const rowModeData = rowModesModel[r.id];
      return rowModeData && rowModeData.mode === GridRowModes.Edit;
    });

    return (
      <GridToolbarContainer>
        <Button color='primary' variant='contained' startIcon={<AddIcon />} onClick={handleAddNewClick}
          disabled={isAnyRowInEditMode}
        >
          Create a bet
        </Button>
      </GridToolbarContainer>
    );
  }


  //#region Delete dialog

  const handleClickOpenOnDeleteDialog = (id: GridRowId) => () => {
    setDeleteRowId(parseInt(id.toString(), 10));
    setOpenDeleteDialog(true);
  };
  
  const handleCloseOnDeleteDialog = () => {
    setDeleteRowId(undefined);
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
              ? Enums.ActionType.EDITED
              : Enums.ActionType.SAVED,
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
              actionTypeApplied: Enums.ActionType.CANCELED,
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
            actionTypeApplied: Enums.ActionType.EDITED,
          };
        } else {
          return {
            ...row,
            actionTypeApplied: undefined,
          };
        }
      });
    });
    setRowModesModel((previousRowModesModel) => {
      let newRowsModel: GridRowModesModel = {};
      newRowsModel[id] = { mode: GridRowModes.Edit };
      for(var i = 0; i <= rows!.length - 1; i++) {
        const currentRow = rows![i];
        if(currentRow.id === id) {
          newRowsModel[currentRow.id] = { mode: GridRowModes.Edit };
        } else {
          newRowsModel[currentRow.id] = { mode: GridRowModes.View };
        }
      }

      return newRowsModel;
    });
  };

  const handleHistoryClick = async (params: GridRowParams) => {
    const row = rows!.find((row) => row.id === params.id);

    if(!row) {
      return;
    }
    // const betId = await selectBetIdFn(row.id);
    const history = await getBetHistory(row.id);
    
    setShowHistoryModal(true);
    setHistory(history);
  }

  const handleDeleteClick = async () => {
    if(!deleteRowId) {
      return;
    }

      setIsLoading(true);
      
      await deleteBet({ id: deleteRowId, });
      setDeleteRowId(undefined);
      setOpenDeleteDialog(false);
      setRows((previousRows) => previousRows!.filter((row) => row.id !== deleteRowId));
      setRowModesModel((previousRowModesModel) => {
        return { ...previousRowModesModel, [deleteRowId]: { mode: GridRowModes.View } };
      });

      setIsLoading(false);
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
          winStatus: clickedRow?.winStatus,
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
          dateFinished: undefined,
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
      selectBetIdFn(row.id);
    }
  }

  //#endregion Actions handlers

  //#region Rows update handler

  const processRowUpdate = async (newRow: GridRowModel) => {
    const currentRow = rows?.find((row) => row.id === newRow.id);
    
    if(currentRow?.actionTypeApplied === Enums.ActionType.SAVED
        || currentRow?.actionTypeApplied === Enums.ActionType.EDITED) {
          const newRowData: BetModel = {
            ...currentRow,
            dateCreated: newRow.dateCreated,
            betStatus: newRow.betStatus,
            winStatus: newRow.winStatus,
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
            dateFinished: new Date(),
            profits: newRow.profits,
            notes: newRow.notes,
          };

          setIsLoading(true);

          const rowData = await upsertBet(newRowData);

          setRows((previousRowsModel) => {
            return previousRowsModel!.map((row) => {
              if(row.id === newRow.id) {
                return { 
                  ...newRowData, 
                  id: rowData?.data.id,
                  totalAmount: rowData?.data.totalAmount,
                  isSavedInDatabase: true,
                };
              } else {
                return row;
              }
            });
          });

          setRowModesModel((previousRowModesModel) => {
            return { ...previousRowModesModel, [rowData?.data.id]: { mode: GridRowModes.View } }
          });

          setIsLoading(false);

          newRow.id = rowData?.data.id;
    } else {
      setRowModesModel((previousRowModesModel) => {
        return { ...previousRowModesModel, [newRow.id]: { mode: GridRowModes.View } }
      });
    }

    toast(currentRow?.actionTypeApplied === Enums.ActionType.CANCELED 
      ? 'Canceled' 
      : `Saved bet with id ${newRow!.id}`,
    {
      position: 'top-center',
    });
    
    return newRow;
  };

  //#endregion Rows update handler
  
  //#region Dropdown handlers

  const onChange = (event: any, value: {
    rowId: GridRowId | undefined;
    type: string;
    value?: string;
    label?: string,
  } | null): void => {
    setRows((previousRowsModel) => {
      return previousRowsModel!.map((row) => {
        if(row.id === value?.rowId) {
          return {
            ...row, 
            counteragentId: value.type === ItemTypes.COUNTERAGENT
              ? parseInt(value.value!)
              : row.counteragentId,
            counteragent: value.type === ItemTypes.COUNTERAGENT
              ? value.label
              : row.counteragent,
            selection: value.type === ItemTypes.SELECTION
              ? value.label
              : row.selection,
            sport: value.type === ItemTypes.SPORT
              ? value.value
              : row.sport,
            market: value.type === ItemTypes.MARKET
              ? value.value
              : row.market,
            tournament: value.type === ItemTypes.TOURNAMENT
              ? value.value
              : row.tournament,
          };
        } else {
          return row;
        }
      });
    });
  }

  //#endreigon Dropdown handlers

  const columns: Array<GridColDef> = [
    {
      field: 'id',
      type: 'number',
      valueGetter: (params) => {
        const row = rows?.find(r => r.id === params.id);
        if (!row) {
          return null;
        }
        if (!row.isSavedInDatabase) {
          return null;
        }
        return params.id;
      }
    },
    {
      field: 'dateCreated',
      headerName: 'Date created',
      type: 'date',
      editable: false,
      width: 150,
      renderCell: (params) => {
        const row = rows 
          ? rows.find((r) => r.id === params.id)
          : undefined;

        if(!row) {
          throw Error(`Row did not found.`);
        }

        return <Tooltip title={`${row.dateCreated.toLocaleDateString()} - ${row.dateCreated.toLocaleTimeString()}`}>
          <span>{row.dateCreated.toLocaleDateString()}</span>
        </Tooltip>
      }
    },
    {
      field: 'betStatus',
      headerName: 'Bet status',
      type: 'singleSelect',
      editable: true,
      valueOptions: Object.keys(BetStatus)
        .filter((k) => !isNaN(Number(k)))
        .map(
          (key: any) => {
            return { value: Number(key), label: BetStatus[key], }
          },
        ),
      valueFormatter(params) {
        const colDef = params.api.getColumn(params.field);
        const option = (colDef as any).valueOptions.find(
          (option: { value: number; label: string; }) => option.value === params.value
        );

        return option.label;
      },
      width: 150,
    },
    {
      field: 'winStatus',
      headerName: 'Win status',
      type: 'singleSelect',
      editable: true,
      valueOptions: Object.keys(WinStatus)
        .filter((k) => !isNaN(Number(k)))
        .map(
          (key: any) => {
            return { value: Number(key), label: WinStatus[key], }
          },
        ),
      valueFormatter(params) {
        const colDef = params.api.getColumn(params.field);
        const option = (colDef as any).valueOptions.find(
          (option: { value: number; label: string; }) => option.value === params.value
        );

        return option.label;
      },
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
      valueOptions: possibleCounteragents,
      renderCell: (params: GridRenderCellParams) => {
        const row = rows 
          ? rows?.find((r) => r.id === params.id)
          : undefined;

        if(!row) {
          throw Error(`Row did not found.`);
        }

        return (
          <>
            {row.counteragent}
          </>
        )
      },
      renderEditCell: (params: GridRenderEditCellParams) => {
        const row = rows 
          ? rows.find((r) => r.id === params.id)
          : undefined;

        if(!row) {
          throw Error(`Row did not found.`);
        }

        return (
          <Autocomplete
            disablePortal
            options={
              possibleCounteragents
                ? possibleCounteragents.map((counteragent) => {
                  return {
                        rowId: params.id, 
                        type: ItemTypes.COUNTERAGENT, 
                        value: counteragent.value, 
                        label: counteragent.label, 
                      };
                  })
                : []
            }       
            sx={{ width: 300 }}
            renderInput={(params: any) => <TextField {...params} 
              label={ItemTypes.COUNTERAGENT} />}
            onChange={onChange}
            value={
              row.counteragentId
                ? {
                    rowId: params.id,
                    type: ItemTypes.COUNTERAGENT,
                    value: row.counteragentId.toString(),
                    label: row.counteragent,
                  }
                : null
            }
          />
        )
      }
    },
    {
      field: 'selection',
      headerName: 'Selection',
      type: 'singleSelect',
      editable: true,
      width: 300,
      renderCell: (params: GridRenderCellParams) => {
        const row = rows 
          ? rows.find((r) => r.id === params.id)
          : undefined;

        if(!row) {
          throw Error(`Row did not found.`);
        }

        return (
          <>
            {row.selection}
          </>
        );
      },
      renderEditCell: (params: GridRenderEditCellParams) => {
        const row = rows 
          ? rows.find((r) => r.id === params.id)
          : undefined;

        if(!row) {
          throw Error(`Row did not found.`);
        }

        const possibleSelections: Array<string> = row.counteragentId
          ? allSelections[row.counteragentId]
          : [];
        return (
          <Autocomplete
            disablePortal
            options={possibleSelections.map((selection: string) => {
                  return {
                        rowId: params.id, 
                        type: ItemTypes.SELECTION, 
                        value: selection, 
                        label: selection, 
                      };
                  })
            }       
            sx={{ width: 300 }}
            renderInput={(params: any) => <TextField {...params} 
              label={ItemTypes.SELECTION} />}
            onChange={onChange}
            value={
              row.selection
                ? {
                    rowId: params.id,
                    type: ItemTypes.SELECTION,
                    value: row.selection,
                    label: row.selection,
                  }
                : null
            }
          />
        )
      }
    },
    {
      field: 'sport',
      headerName: 'Sport',
      type: 'singleSelect',
      editable: true,
      width: 300,
      valueOptions: possibleSports,
      renderCell: (params: GridRenderCellParams) => {
        const row = rows 
          ? rows.find((r) => r.id === params.id)
          : undefined;

        if(!row) {
          throw Error(`Row did not found.`);
        }

        return (
          <>
            {row.sport}
          </>
        )
      },
      renderEditCell: (params: GridRenderEditCellParams) => {
        const row = rows 
          ? rows.find((r) => r.id === params.id)
          : undefined;

        if(!row) {
          throw Error(`Row did not found.`);
        }

        return (
          <Autocomplete
            disablePortal
            options={
              possibleSports
                ? possibleSports.map((sport) => {
                  return {
                        rowId: params.id, 
                        type: ItemTypes.SPORT, 
                        value: sport.value, 
                        label: sport.label + ' ', 
                      };
                  })
                : []
            }       
            sx={{ width: 300 }}
            renderInput={(params: any) => <TextField {...params} 
              label={ItemTypes.SPORT} />}
            onChange={onChange}
            value={
              row.sport
                ? {
                    rowId: params.id,
                    type: ItemTypes.SPORT,
                    value: row.sport,
                    label: row.sport + ' ',
                  }
                : null
            }
          />
        )
      }
    },
    {
      field: 'liveStatus',
      headerName: 'Live status',
      type: 'singleSelect',
      editable: true,
      valueOptions: Object.keys(LiveStatus)
        .filter((k) => !isNaN(Number(k)))
        .map(
          (key: any) => {
            return { value: Number(key), label: LiveStatus[key], }
          },
        ),
      valueFormatter(params) {
        const colDef = params.api.getColumn(params.field);
        const option = (colDef as any).valueOptions.find(
          (option: { value: number; label: string; }) => option.value === params.value
        );

        return option.label;
      },
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
      valueOptions: possibleMarkets,
      renderCell: (params: GridRenderCellParams) => {
        const row = rows 
          ? rows.find((r) => r.id === params.id)
          : undefined;

        if(!row) {
          throw Error(`Row did not found.`);
        }

        return (
          <>
            {row.market}
          </>
        )
      },
      renderEditCell: (params: GridRenderEditCellParams) => {
        const row = rows 
          ? rows.find((r) => r.id === params.id)
          : undefined;

        if(!row) {
          throw Error(`Row did not found.`);
        }

        return (
          <Autocomplete
            disablePortal
            options={
              possibleMarkets
                ? possibleMarkets.map((market) => {
                  return {
                        rowId: params.id,
                        type: ItemTypes.MARKET,
                        value: market.value,
                        label: market.label + ' ',
                      };
                  })
                : []
            }       
            sx={{ width: 300 }}
            renderInput={(params: any) => <TextField {...params} 
              label={ItemTypes.MARKET} />}
            onChange={onChange}
            value={
              row.market
                ? {
                    rowId: params.id,
                    type: ItemTypes.MARKET,
                    value: row.market,
                    label: row.market + ' ',
                  }
                : null
            }
          />
        )
      }
    },
    {
      field: 'tournament',
      headerName: 'Tournament',
      type: 'singleSelect',
      editable: true,
      width: 300,
      valueOptions: possibleTournaments,
      renderCell: (params: GridRenderCellParams) => {
        const row = rows 
          ? rows.find((r) => r.id === params.id)
          : undefined;

        if(!row) {
          throw Error(`Row did not found.`);
        }

        return (
          <>
            {row.tournament}
          </>
        )
      },
      renderEditCell: (params: GridRenderEditCellParams) => {
        const row = rows 
          ? rows.find((r) => r.id === params.id)
          : undefined;

        if(!row) {
          throw Error(`Row did not found.`);
        }

        return (
          <Autocomplete
            disablePortal
            options={
              possibleTournaments
                ? possibleTournaments.map((tournament) => {
                  return {
                        rowId: params.id, 
                        type: ItemTypes.TOURNAMENT, 
                        value: tournament.value, 
                        label: tournament.label + ' ', 
                      };
                  })
                : []
            }       
            sx={{ width: 300 }}
            renderInput={(params: any) => <TextField {...params} 
              label={ItemTypes.TOURNAMENT} />}
            onChange={onChange}
            value={
              row.tournament
                ? {
                    rowId: params.id,
                    type: ItemTypes.TOURNAMENT,
                    value: row.tournament,
                    label: row.tournament + ' ',
                  }
                : null
            }
          />
        )
      }
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
      editable: false,
      width: 150,
      valueGetter: (params) => {
        if(!currencies || currencies.length === 0) {
          return 0;
        }

        const eurCurrency = currencies.find((c) => c.abbreviation ==='EUR');
        const usdCurrency = currencies.find((c) => c.abbreviation ==='USD');
        const gbpCurrency = currencies.find((c) => c.abbreviation ==='GBP');

        if(!eurCurrency || !usdCurrency || !gbpCurrency) {
          return 0;
        }

        let totalAmount = 0;
        totalAmount += !isNaN(params.row.amountBGN)
          ? parseInt(params.row.amountBGN)
          : 0;

        totalAmount += !isNaN(params.row.amountEUR)
          ? parseInt(params.row.amountEUR) * eurCurrency.conversionRateToBGN
          : 0;

        totalAmount += !isNaN(params.row.amountUSD)
          ? parseInt(params.row.amountUSD) * usdCurrency.conversionRateToBGN
          : 0;

        totalAmount += !isNaN(params.row.amountGBP)
          ? parseInt(params.row.amountGBP) * gbpCurrency.conversionRateToBGN
          : 0;

        return params.row && params.row.totalAmount
          ? params.row.totalAmount
          : totalAmount;
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
      editable: false,
      width: 150,
    },
    {
      field: 'profits',
      headerName: 'Profits',
      type: 'number',
      editable: false,
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
        if(isRead) {
          return [];
        } else {
          const isAnyOtherRowInEditMode = rows?.some((r) => {
            if(r.id === params.id) {
              return false;
            }

            const rowModeData = rowModesModel[r.id];
            return rowModeData && rowModeData.mode === GridRowModes.Edit;
          });

          if(isAnyOtherRowInEditMode) {
            return [];
          }

          return isInEditMode 
          ? [
                <GridActionsCellItem
                  icon={<SaveIcon />}
                  label='Save'
                  onClick={handleSaveClick(params.id)}
                />,
                <GridActionsCellItem
                  icon={<CancelIcon />}
                  label='Cancel'
                  className='textPrimary'
                  onClick={handleCancelClick(params.id)}
                  color='inherit'
                />,
            ]
          : [
              <GridActionsCellItem
                icon={<EditIcon />}
                label='Edit'
                className='textPrimary'
                onClick={handleEditClick(params.id)}
                color='inherit'
              />,
              <GridActionsCellItem
                icon={<HistoryIcon />}
                label='Bet History'
                className='textPrimary'
                onClick={() => handleHistoryClick(params) as any}
                color='inherit'
              />,
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label='Delete'
                onClick={handleClickOpenOnDeleteDialog(params.id)}
                color='inherit'
              />,
              <GridActionsCellItem
                icon={<AddIcon />}
                label='Copy bet'
                onClick={handleCopyBetClick(params.id)}
                color='inherit'
              />,
            ]
        }
      },
    }
  ];

  const handleModalClose = () => setShowHistoryModal(false);
  if (showHistoryModal && history) {
    return <Modal open={showHistoryModal} handleClose={handleModalClose} betsHistory={history} />
  }

  return (
    <Paper sx={{ padding: '5%'}}>
      {
        rows
          ? (
              <>
                <DataGridPro
                  columns={columns}
                  columnBuffer={2} 
                  columnThreshold={2}
                  rows={rows}   
                  slots={{
                    toolbar: isRead
                      ? undefined
                      : EditToolbar,
                  }}
                  rowModesModel={rowModesModel}
                  processRowUpdate={processRowUpdate}
                  slotProps={{
                    toolbar: { setRows, setRowModesModel },
                  }}
                  onRowClick={onRowClick}
                  editMode='row'
                  sx={
                    { 
                      height: 500,
                    }
                  }
                />
                <Dialog
                  open={deleteDialogIsOpened}
                  onClose={handleCloseOnDeleteDialog}
                  aria-labelledby='alert-dialog-title'
                  aria-describedby='alert-dialog-description'
                >
                  <DialogTitle id='alert-dialog-title'>
                    {'Are you sure you want to delete the bet?'}
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
  