import {
    GridActionsCellItem, GridColDef, GridRenderCellParams,
    GridRenderEditCellParams, GridRowId, GridRowModes,
    GridRowModesModel, GridRowParams, GridSortCellParams, GridSortModel, GridValueGetterParams,
} from '@mui/x-data-grid';
import { Tooltip, Autocomplete, TextField, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import ColorizeIcon from '@mui/icons-material/Colorize';
import CancelIcon from '@mui/icons-material/Close';
import { BetModel, IDropdownValue, WinStatus, LiveStatus } from '../../models';
import { Currency, } from '../../database-models';
import { GridApiCommunity } from '@mui/x-data-grid/internals';

export const getBetsColumns = (props: { 
    rows: Array<BetModel>, 
    setRows: React.Dispatch<React.SetStateAction<Array<BetModel>>>,
    apiRef: React.MutableRefObject<GridApiCommunity>,
    possibleCounterаgents: Array<IDropdownValue> | undefined,
    possibleSports: Array<IDropdownValue> | undefined,
    possibleTournaments: Array<IDropdownValue> | undefined,
    possibleSelections: Array<{ id: number; selections: Array<IDropdownValue> | undefined, }>,
    possibleMarkets: Array<IDropdownValue> | undefined,
    currencies: Array<Currency> | undefined,
    rowModesModel: GridRowModesModel,
    id: 'pending' | 'completed' | 'search',
    isMobile: boolean,
    handleSaveClick: (id: GridRowId) => () => void,
    handleCancelClick: (id: GridRowId) => () => void,
    handleEditClick: (id: GridRowId) => () => void,
    handleHistoryClick: (params: GridRowParams) => Promise<void>,
    handleCopyBetClick: (id: GridRowId) => () => void,
    handleClickOpenOnDeleteDialog: (id: GridRowId) => () => void,
    handleClickOpenOnColorDialog: (id: GridRowId) => () => void;
  }): Array<GridColDef>  => {
    const { rows, setRows, apiRef, possibleCounterаgents, possibleSports, 
      possibleTournaments, possibleSelections, possibleMarkets, 
      currencies, rowModesModel,  id, isMobile, 
      handleSaveClick, handleCancelClick, handleEditClick, handleHistoryClick, 
      handleCopyBetClick, handleClickOpenOnDeleteDialog, handleClickOpenOnColorDialog, } = props;

    const columns: Array<GridColDef> = [
        {
          field: 'id',
          type: 'number',
          valueGetter: (params) => {
            const row = rows.find((r) => r.id === params.id)
            if (!row || !row.isSavedInDatabase) {
              return null;
            }

            return params.id;
          },
          sortable: true,
          sortingOrder: [ 'asc', 'desc', ]
        },
        {
          field: 'winStatus',
          headerName: 'Status',
          editable: true,
          width: 150,
          renderCell: (params: GridRenderCellParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return <>{row.winStatus ? row.winStatus.label : ''}</>;
          },
          renderEditCell: (params: GridRenderEditCellParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return (
              <Autocomplete
                options={[
                  { id: '0', label: WinStatus[0] },
                  { id: '1', label: WinStatus[1] },
                  { id: '2', label: WinStatus[2] },
                  { id: '3', label: WinStatus[3] },
                  { id: '4', label: WinStatus[4] },
                  { id: '5', label: WinStatus[5] },
                ]}
                renderOption={(props, option) => {
                  return (
                    <span {...props} style={{ backgroundColor: 'white' }}>
                      {option.label}
                    </span>
                  );
                }}
                renderInput={(params) => <TextField {...params} />}
                onChange={(e, value: any) => {
                  setRows((previousRowsModel) => {
                    return previousRowsModel.map((row: BetModel) => {
                      if (row.id === params.row.id) {
                        return {
                          ...row,
                          winStatus: value
                            ? typeof value === 'string'
                              ? { id: value, label: value }
                              : value
                            : undefined,
                        };
                      } else {
                        return row;
                      }
                    });
                  });
                }}
                value={row.winStatus}
                sx={{
                  width: 300,
                }}
              />
            );
          },
          valueGetter: (params: GridValueGetterParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return row.winStatus;
          },
        },
        {
          field: 'counterAgent',
          headerName: 'Counteragent',
          editable: true,
          sortable: true,
          sortingOrder: [ 'asc', 'desc', ],
          width: 180,
          renderCell: (params: GridRenderCellParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return <>{row.counterAgent ? row.counterAgent.label : ''}</>;
          },
          renderEditCell: (params: GridRenderEditCellParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return (
              <Autocomplete
                options={possibleCounterаgents ? possibleCounterаgents : []}
                renderOption={(props, option) => {
                  return (
                    <span {...props} style={{ backgroundColor: 'white' }}>
                      {option.label}
                    </span>
                  );
                }}
                renderInput={(params) => <TextField {...params} />}
                onChange={(e, value: any) => {
                  if(value && value.id && value.label) {
                    setRows((previousRowsModel) => {
                      return previousRowsModel.map((row: BetModel) => {
                        if (row.id === params.row.id) {
                          return {
                            ...row,
                            counterAgent: value,
                          };
                        } else {
                          return row;
                        }
                      });
                    });
                  }
                }}
                value={row.counterAgent}
                sx={{
                  width: 300,
                }}
              />
            );
          },
          valueGetter: (params: GridValueGetterParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return row.counterAgent;
          },
        },
        {
          field: 'sport',
          headerName: 'Sport',
          editable: true,
          sortable: true,
          sortingOrder: [ 'asc', 'desc', ],
          width: 150,
          renderCell: (params: GridRenderCellParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return <>{row.sport ? row.sport.label : ''}</>;
          },
          renderEditCell: (params: GridRenderEditCellParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return (
              <Autocomplete
                freeSolo
                options={possibleSports ? possibleSports : []}
                renderOption={(props, option) => {
                  return (
                    <span {...props} style={{ backgroundColor: 'white' }}>
                      {option.label}
                    </span>
                  );
                }}
                renderInput={(params) => <TextField {...params}
                  onBlurCapture={(p) => {
                    const value = (p.target as any).value;
                    setRows((previousRowsModel) => {
                      return previousRowsModel.map((r: BetModel) => {
                        if (r.id === row.id) {
                          const sport = value
                            ? typeof value === 'string'
                              ? { id: value, label: value }
                              : value
                            : undefined;
      
                          return {
                            ...row,
                            sport,
                          };
                        } else {
                          return r;
                        }
                      });
                    });
                  }}
                />}
                onChange={(e, value: any) => {
                  setRows((previousRowsModel) => {
                    return previousRowsModel.map((row: BetModel) => {
                      if (row.id === params.row.id) {
                        const sport = value
                          ? typeof value === 'string'
                            ? { id: value, label: value }
                            : value
                          : undefined;
    
                        return {
                          ...row,
                          sport,
                        };
                      } else {
                        return row;
                      }
                    });
                  });
                }}
                value={row.sport}
                sx={{
                  width: 300,
                }}
              />
            );
          },
          valueGetter: (params: GridValueGetterParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return row.sport;
          },
        },
        {
          field: 'liveStatus',
          headerName: 'Live status',
          editable: true,
          sortable: true,
          sortingOrder: [ 'asc', 'desc', ],
          width: 150,
          renderCell: (params: GridRenderCellParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return <>{row.liveStatus ? row.liveStatus.label : ''}</>;
          },
          renderEditCell: (params: GridRenderEditCellParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return (
              <Autocomplete
                options={[
                  { id: '0', label: LiveStatus[0] },
                  { id: '1', label: LiveStatus[1] },
                  { id: '2', label: LiveStatus[2] },
                  { id: '3', label: LiveStatus[3] },
                  { id: '4', label: LiveStatus[4] },
                  { id: '5', label: LiveStatus[5] },
                ]}
                renderOption={(props, option) => {
                  return (
                    <span {...props} style={{ backgroundColor: 'white' }}>
                      {option.label}
                    </span>
                  );
                }}
                renderInput={(params) => <TextField {...params} />}
                onChange={(e, value: any) => {
                  setRows((previousRowsModel) => {
                    return previousRowsModel.map((row: BetModel) => {
                      if (row.id === params.row.id) {
                        return {
                          ...row,
                          liveStatus: value
                            ? typeof value === 'string'
                              ? { id: value, label: value }
                              : value
                            : undefined,
                        };
                      } else {
                        return row;
                      }
                    });
                  });
                }}
                value={row.liveStatus}
                sx={{
                  width: 300,
                }}
              />
            );
          },
          valueGetter: (params: GridValueGetterParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return row.liveStatus;
          },
        },
        {
          field: 'psLimit',
          headerName: 'PS Limit',
          type: 'number',
          editable: true,
          width: 150,
          align: 'center',
          sortable: true,
          sortingOrder: [ 'asc', 'desc', ],
        },
        {
          field: 'market',
          headerName: 'Market',
          editable: true,
          sortable: true,
          sortingOrder: [ 'asc', 'desc', ],
          width: 120,
          renderCell: (params: GridRenderCellParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return <>{row.market ? row.market.label : ''}</>;
          },
          renderEditCell: (params: GridRenderEditCellParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return (
              <Autocomplete
                freeSolo
                options={possibleMarkets ? possibleMarkets : []}
                renderOption={(props, option) => {
                  return (
                    <span {...props} style={{ backgroundColor: 'white' }}>
                      {option.label}
                    </span>
                  );
                }}
                renderInput={(params) => <TextField {...params}
                  onBlurCapture={(p) => {
                    const value = (p.target as any).value;
                    setRows((previousRowsModel) => {
                      return previousRowsModel.map((r: BetModel) => {
                        if (r.id === row.id) {
                          const market = value
                            ? typeof value === 'string'
                              ? { id: value, label: value }
                              : value
                            : undefined;

                          return {
                            ...row,
                            market,
                          };
                        } else {
                          return r;
                        }
                      });
                    });
                  }}
                />}
                onChange={(e, value: any) => {
                  setRows((previousRowsModel) => {
                    return previousRowsModel.map((row: BetModel) => {
                      if (row.id === params.row.id) {
                        const market = value
                          ? typeof value === 'string'
                            ? { id: value, label: value }
                            : value
                          : undefined;
    
                        return {
                          ...row,
                          market,
                        };
                      } else {
                        return row;
                      }
                    });
                  });
                }}
                value={row.market}
                sx={{
                  width: 300,
                }}
              />
            );
          },
          valueGetter: (params: GridValueGetterParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return row.market;
          },
        },
        {
          field: 'selection',
          headerName: 'Selection',
          editable: true,
          sortable: true,
          sortingOrder: [ 'asc', 'desc', ],
          width: 450,
          renderCell: (params: GridRenderCellParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return <>{row.selection ? row.selection.label : ''}</>;
          },
          renderEditCell: (params: GridRenderEditCellParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            let possibleSelectionsForBet: Array<IDropdownValue> = [];
            if(row.counterAgent) {
              const c = possibleSelections.find((s) => s.id === parseInt(row.counterAgent!.id));
              if(c) {
                possibleSelectionsForBet = c.selections!;
              }
            }
            

            return (
              <Autocomplete
                freeSolo
                options={possibleSelectionsForBet}
                renderOption={(props, option) => {
                  return (
                    <span {...props} style={{ backgroundColor: 'white' }}>
                      {option.label}
                    </span>
                  );
                }}
                renderInput={(params) => <TextField {...params} 
                onBlurCapture={(p) => { 
                  const value = (p.target as any).value;
                  setRows((previousRowsModel) => {
                    return previousRowsModel.map((r: BetModel) => {
                      if (r.id === row.id) {
                        const selection = value
                          ? typeof value === 'string'
                            ? { id: value, label: value }
                            : value
                          : undefined;
    
                        return {
                          ...row,
                          selection,
                        };
                      } else {
                        return r;
                      }
                    });
                  });
                  }}/>}
                onChange={(e, value: any) => {
                  setRows((previousRowsModel) => {
                    return previousRowsModel.map((row: BetModel) => {
                      if (row.id === params.row.id) {
                        const selection = value
                          ? typeof value === 'string'
                            ? { id: value, label: value }
                            : value
                          : undefined;
    
                        return {
                          ...row,
                          selection,
                        };
                      } else {
                        return row;
                      }
                    });
                  });
                }}
                value={row.selection}
                sx={{
                  width: 300,
                }}
              />
            );
          },
          valueGetter: (params: GridValueGetterParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return row.selection;
          },
        },
        {
          field: 'odd',
          headerName: 'Odd',
          type: 'number',
          editable: true,
          width: 100,
          sortable: true,
          sortingOrder: [ 'asc', 'desc', ],
        },
        {
          field: 'notes',
          headerName: 'Notes',
          type: 'string',
          editable: true,
          width: 600,
          sortable: false,
        }, 
        {
          field: 'tournament',
          headerName: 'Tournament',
          editable: true,
          sortable: true,
          sortingOrder: [ 'asc', 'desc', ],
          width: 300,
          renderCell: (params: GridRenderCellParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return <>{row.tournament ? row.tournament.label : ''}</>;
          },
          renderEditCell: (params: GridRenderEditCellParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return (
              <Autocomplete
                freeSolo
                options={possibleTournaments ? possibleTournaments : []}
                renderOption={(props, option) => {
                  return (
                    <span {...props} style={{ backgroundColor: 'white' }}>
                      {option.label}
                    </span>
                  );
                }}
                renderInput={(params) => <TextField {...params}
                  onBlurCapture={(p) => {
                    const value = (p.target as any).value;
                    setRows((previousRowsModel) => {
                      return previousRowsModel.map((r: BetModel) => {
                        if (r.id === row.id) {
                          const tournament = value
                            ? typeof value === 'string'
                              ? { id: value, label: value }
                              : value
                            : undefined;

                          return {
                            ...row,
                            tournament,
                          };
                        } else {
                          return r;
                        }
                      });
                    });
                  }}
                />}
                onChange={(e, value: any) => {
                  setRows((previousRowsModel) => {
                    return previousRowsModel.map((row: BetModel) => {
                      if (row.id === params.row.id) {
                        const tournament = value
                          ? typeof value === 'string'
                            ? { id: value, label: value }
                            : value
                          : undefined;
    
                        return {
                          ...row,
                          tournament,
                        };
                      } else {
                        return row;
                      }
                    });
                  });
                }}
                value={row.tournament}
                sx={{
                  width: 300,
                }}
              />
            );
          },
          valueGetter: (params: GridValueGetterParams<BetModel>) => {
            const row = rows.find((r) => r.id === params.row.id);
            if (!row) {
              return;
            }
    
            return row.tournament;
          },
        },
        {
          field: 'stake',
          headerName: 'Stake',
          type: 'number',
          editable: true,
          width: 120,
          align: 'right',
          sortable: true,
          sortingOrder: [ 'asc', 'desc', ],
        },
        {
          field: 'dateCreated',
          headerName: 'Date created',
          type: 'date',
          editable: false,
          width: 180,
          sortable: true,
          sortingOrder: [ 'asc', 'desc', ],
          renderCell: (params) => {
            const row = rows.find((r) => r.id === params.id);
    
            if (!row) {
              throw Error(`Row did not found.`);
            }
    
            return (
              <Tooltip
                title={`${row.dateCreated.toLocaleDateString()} `}
              >
                <span>{row.dateCreated.toLocaleDateString()}</span>
              </Tooltip>
            );
          },
        },
        {
          field: 'dateFinished',
          headerName: 'Date finished',
          type: 'date',
          editable: false,
          width: 180,
          sortable: true,
          sortingOrder: [ 'asc', 'desc', ],
        },
        {
          field: 'totalAmount',
          headerName: 'Total amount',
          type: 'number',
          editable: false,
          width: 180,
          sortable: true,
          sortingOrder: [ 'asc', 'desc', ],
          valueGetter: (params) => {
            if (!currencies || currencies.length === 0) {
              return 0;
            }
    
            return params.row && params.row.totalAmount
              ? params.row.totalAmount.toFixed(2)
              : 0;
          },
        },
        {
          field: 'profits',
          headerName: 'P/L',
          type: 'number',
          editable: false,
          width: 100,
          sortable: true,
          sortingOrder: [ 'asc', 'desc', ],
        },      
        {
          field: 'actions',
          headerName: 'Actions',
          type: 'actions',
          width: 180,
          cellClassName: 'actions',
          getActions: (params) => {
            const isInEditMode =
              rowModesModel[params.id]?.mode === GridRowModes.Edit;
            if (id === 'search') {
              const isAnyOtherRowInEditMode = rows?.some((r) => {
                if (r.id === params.id) {
                  return false;
                }
    
                const rowModeData = rowModesModel[r.id];
                return rowModeData && rowModeData.mode === GridRowModes.Edit;
              });
    
              if (isAnyOtherRowInEditMode) {
                return [];
              }
    
              return isInEditMode
                ? !isMobile
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
                    : []
                : !isMobile
                  ? [
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
                    ]
                  : [];
            } else if(id === 'pending') {
              const isAnyOtherRowInEditMode = rows?.some((r) => {
                if (r.id === params.id) {
                  return false;
                }
    
                const rowModeData = rowModesModel[r.id];
                return rowModeData && rowModeData.mode === GridRowModes.Edit;
              });
    
              if (isAnyOtherRowInEditMode) {
                return [];
              }
    
              return isInEditMode
                ? !isMobile
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
                  : []
                : !isMobile
                  ? [
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
                        icon={<ColorizeIcon />}
                        label='Color'
                        onClick={handleClickOpenOnColorDialog(params.id)}
                        color='inherit'
                      />,
                      <GridActionsCellItem
                        icon={<AddIcon />}
                        label='Copy bet'
                        onClick={handleCopyBetClick(params.id)}
                        color='inherit'
                      />,
                    ]
                  : [
                      <GridActionsCellItem
                        icon={<HistoryIcon />}
                        label='Bet History'
                        className='textPrimary'
                        onClick={() => handleHistoryClick(params) as any}
                        color='inherit'
                      />,
                    ];
            } else if(id === 'completed') {
              const isAnyOtherRowInEditMode = rows?.some((r) => {
                if (r.id === params.id) {
                  return false;
                }
    
                const rowModeData = rowModesModel[r.id];
                return rowModeData && rowModeData.mode === GridRowModes.Edit;
              });
    
              if (isAnyOtherRowInEditMode) {
                return [];
              }
    
              return isInEditMode
                ? !isMobile
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
                  : []
                : !isMobile
                  ? [
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
                    ]
                  : [
                      <GridActionsCellItem
                        icon={<HistoryIcon />}
                        label='Bet History'
                        className='textPrimary'
                        onClick={() => handleHistoryClick(params) as any}
                        color='inherit'
                      />,
                    ];
            } else {
              return [];
            }
          },
        },
    ];

    return columns;
}