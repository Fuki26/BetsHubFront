import * as React from 'react';
import { toast } from 'react-toastify';
import { isMobile } from 'react-device-detect';
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowId, 
  GridRowModel, GridRowModes, GridRowModesModel,  GridToolbarContainer, GridValueGetterParams,
  GridToolbarExport, GridRowParams, GridEventListener, GridSortCellParams, GridSortModel, useGridApiRef, } from '@mui/x-data-grid';
import { Autocomplete, Button, Dialog, DialogActions, DialogTitle, Paper, TextField,Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import CancelIcon from '@mui/icons-material/Close';
import { ActionType, EditToolbarProps, ExpenseModel, IDropdownValue, } from '../../models';
import { deleteExpense, getExpenseHistory, upsertExpense } from '../../api';
import ExpensesToolbar from '../ExpensesToolbar/ExpensesToolbar';
import Modal from '../UI/Modal';
import { useState } from 'react';
import { GridApiCommunity } from '@mui/x-data-grid/internals';

export default function Expenses(props: { 
  isRead: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  defaultRows: Array<ExpenseModel> | null;
  possibleCounterAgents: Array<IDropdownValue> | undefined;
  displayExportToolbar: boolean | null;
}) {
  const { isRead, setIsLoading, defaultRows, possibleCounterAgents, } = props;

  const [ rows, setRows, ] = React.useState<Array<ExpenseModel> | null>(defaultRows);
  const [ rowModesModel, setRowModesModel, ] = React.useState<GridRowModesModel>({});
  const [ deleteRowId, setDeleteRowId, ] = React.useState<number | null>(null);
  const [ deleteDialogIsOpened, setOpenDeleteDialog, ] = React.useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState(null);
  const [ totalOfTotals, setTotalOfTotals, ] = React.useState(0);

  const apiRef: React.MutableRefObject<GridApiCommunity> = useGridApiRef();

  React.useEffect(() => {
    setRows((oldRows) => {
      return defaultRows;
    });

    let calculatedTotalOfTotals = defaultRows
        ? defaultRows.reduce((accumulator, currentValue: ExpenseModel) => {
            if (currentValue.amount) {
              return accumulator + Number(currentValue.amount);
            } else {
              return accumulator;
            }
          }, 0)
        : 0;
    setTotalOfTotals(calculatedTotalOfTotals);

    setRowModesModel(() => {
      return {};
    });
  }, [ defaultRows, ]);

  const editToolbar = (props: EditToolbarProps) => {
    const { setRows, setRowModesModel } = props;
  
    if(!possibleCounterAgents || possibleCounterAgents.length === 0) {
      // alert('There are not any possible contraagents in the system. You cannot create an expense.');
      return null;
    }

    const counterAgent = possibleCounterAgents[0];
    const handleAddNewClick = () => {
      const id = Math.round(Math.random() * 1000000);
      const newExpense = {
        id,
        counterAgent: { id: counterAgent.id, label: counterAgent.label },
        amount: 0,
        description: '',
        dateCreated: new Date(),
        actionTypeApplied: undefined,
        isSavedInDatabase: false,
      };
    
      setRows((oldRows) => [newExpense, ...oldRows]);
      setRowModesModel((oldModel) => ({
        [id]: { mode: GridRowModes.Edit },
        ...oldModel,
      }));
    };
    
  
    return !isMobile
      ? (
          <GridToolbarContainer>
            <Button color='primary' variant='contained' startIcon={<AddIcon />} onClick={handleAddNewClick}>
              Create an expense
            </Button>
            <GridToolbarExport 
              csvOptions={{ allColumns: true }}
            />
          </GridToolbarContainer>
        )
      : <></>;
  }

  const tabKeyHandler: GridEventListener<'cellKeyDown'> 
  = (params, event) => {
    if(event.key === 'Enter' && params.cellMode === 'edit') {
      const activeElement = document.activeElement;
      if(activeElement) {
        (activeElement as any).blur();
      }

      const saveButton = document.querySelectorAll('[aria-label="Save"]')[0];
      (saveButton as any).click();
    } 
  };


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
    });
  };

  const handleCancelClick = (id: GridRowId) => () => {
    const canceledRow = rows?.find((r) => r.id === id);
    if(!canceledRow?.isSavedInDatabase) {
      setRows((previousRowsModel) => {
        return previousRowsModel!.filter((row) => {
          return row.id !== id;
        });
      });
      setRowModesModel({});
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

  const handleDeleteClick = async () => {
    if(!deleteRowId) {
      return;
    }

    setIsLoading(true);

    await deleteExpense({ id: deleteRowId, });
    setDeleteRowId(null);
    setOpenDeleteDialog(false);

    setRows((previousRows) => previousRows!.filter((row) => row.id !== deleteRowId));
    let calculatedTotalOfTotals = rows
        ? rows.filter((r) => r.id !== deleteRowId)
          .reduce((accumulator, currentValue: ExpenseModel) => {
            if (currentValue.amount) {
              return accumulator + Number(currentValue.amount);
            } else {
              return accumulator;
            }
          }, 0)
        : 0;
    setTotalOfTotals(calculatedTotalOfTotals);
    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [deleteRowId]: { mode: GridRowModes.View } };
    });

    setIsLoading(false);
  };

  const handleHistoryClick = async (params: GridRowParams) => {
    const row = rows!.find((row) => row.id === params.id);

    if (!row) {
      return;
    }

    const history = await getExpenseHistory(row.id);

    setShowHistoryModal(true);
    setHistory(history);
  };

  //#endregion Actions handlers

  //#region Rows update handler

  const processRowUpdate = async (newRow: GridRowModel) => {
    const currentRow = rows?.find((row) => row.id === newRow.id);
    
    if(currentRow?.actionTypeApplied === ActionType.SAVED
        || currentRow?.actionTypeApplied === ActionType.EDITED) {
          const newRowData: ExpenseModel = {
            ...currentRow,
            counterAgent: currentRow.counterAgent,
            amount: newRow.amount.toFixed(2),
            description: newRow.description,
            dateCreated: newRow.dateCreated,
          };

          if(!newRowData.counterAgent
              || newRowData.amount === null
              || !newRowData.description) {
            setRowModesModel((previousRowModesModel) => {
              return { ...previousRowModesModel, [currentRow.id]: { mode: GridRowModes.Edit } }
            });
            toast(`Counteragent, amount and description should be specified!`, {
              position: 'top-center',
            });
            return;
          }

          setIsLoading(true);
          
          const rowData = await upsertExpense(newRowData);

          setRows((previousRowsModel) => {
            return previousRowsModel!.map((row) => {
              if(row.id === newRow.id) {
                return { 
                  ...newRowData, 
                  id: rowData?.data.id,
                  isSavedInDatabase: true,
                };
              } else {
                return row;
              }
            });
          });

          let calculatedTotalOfTotals = rows
              ? rows.reduce((accumulator, currentValue: ExpenseModel) => {
                  if(currentValue.id === rowData?.data.id) {
                    return accumulator
                  }

                  if (currentValue.amount) {
                    return accumulator + Number(currentValue.amount);
                  } else {
                    return accumulator;
                  }
                }, 0)
              : 0;
          calculatedTotalOfTotals += newRowData.amount ? Number(newRowData.amount) : 0;
          setTotalOfTotals(calculatedTotalOfTotals);

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
    
    toast(currentRow?.actionTypeApplied === ActionType.CANCELED 
      ? 'Canceled' 
      : `Saved expense with id ${newRow!.id}`,
    {
      position: 'top-center',
    });

    return newRow;
  };

  //#endregion Rows update handler

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
        },
        sortable: true,
        sortingOrder: [ 'asc', 'desc', ],
        sortComparator: (
          value1: number, 
          value2: number, 
          cellParam1: GridSortCellParams,
          cellParam2: GridSortCellParams, 
        ) => {
            const sortingModel: GridSortModel = apiRef.current.getSortModel();
            const columnSortingModel = sortingModel.find((model) => {
              return model.field === 'id';
            });

            if(parseInt(cellParam1.id.toString()) > 10000 
              || parseInt(cellParam2.id.toString()) > 10000) {
              if(columnSortingModel!.sort === 'asc') {
                return 1;
              } else {
                return -1;
              }
            }

            if(value1 && !value2) {
              return 1;
            } else if(!value1 && value2) {
              return -1;
            } else if(!value1 && !value2) {
              return 0;
            }

            if (value1 < value2) {
                return -1;
            } else if (value1 > value2) {
                return 1;
            } else {
                return 0;
            }
        },
    },
    {
      field: 'counterAgent',
      headerName: 'Counteragent',
      editable: true,
      width: 170,
      sortable: true,
      sortingOrder: [ 'asc', 'desc', ],
      sortComparator: (
        value1: { id: string; label: string; }, 
        value2: { id: string; label: string; },
        cellParam1: GridSortCellParams,
        cellParam2: GridSortCellParams,
      ) => {
          const sortingModel: GridSortModel = apiRef.current.getSortModel();
          const columnSortingModel = sortingModel.find((model) => {
            return model.field === 'counterAgent';
          });

          if(parseInt(cellParam1.id.toString()) > 10000 
            || parseInt(cellParam2.id.toString()) > 10000) {
            if(columnSortingModel!.sort === 'asc') {
              return 1;
            } else {
              return -1;
            }
          }

          if(value1 && !value2) {
            return 1;
          } else if(!value1 && value2) {
            return -1;
          } else if(!value1 && !value2) {
            return 0;
          }

          const stringA = value1.label.toLowerCase();
          const stringB = value2.label.toLowerCase();
      
          if (stringA < stringB) {
              return -1;
          } else if (stringA > stringB) {
              return 1;
          } else {
              return 0;
          }
      },
      valueFormatter: ({ value }) => {
        if(value) {
          return value.label;
        } else {
          return '';
        }
      },
      renderCell: (params: GridRenderCellParams<ExpenseModel>) => {
        const row = rows?.find((r) => r.id === params.row.id);
        if(!row) {
          return;
        }

        return (
          <>
            {
              row.counterAgent 
                ? row.counterAgent.label
                : ''
            }
          </>
        );
      },
      renderEditCell: (params: GridRenderEditCellParams<ExpenseModel>) => {
        const row = rows?.find((r) => r.id === params.row.id);
        if(!row) {
          return;
        }

        return (
          <Autocomplete
            // freeSolo
            options={
              possibleCounterAgents
                ? possibleCounterAgents
                : []
            }
            renderInput={(params) => 
              <TextField {...params}/>
            }
            onChange={(e, value: any) => {
              setRows((previousRowsModel) => {
                if(!previousRowsModel) {
                  return [];
                }

                return previousRowsModel.map((row: ExpenseModel) => {
                  if(row.id === params.row.id) {
                    return {
                      ...row, 
                      counterAgent: value
                        ? typeof value === 'string'
                          ? { id: value, label: value }
                          : value
                        : undefined
                    };
                  } else {
                    return row;
                  }
                });
              });
            }}
            value={row.counterAgent}
            sx={{
              width: 300,
            }}
          />
        );
      },
      valueGetter: (params: GridValueGetterParams<ExpenseModel>) => {
        if(!rows) {
          return;
        }

        const row = rows.find((r) => r.id === params.row.id);
        if(!row) {
          return;
        }

        return row.counterAgent;
      },
    },
    {
      field: 'amount',
      headerName: 'AmountBGN',
      type: 'number',
      editable: true,
      width: 150,
      align: 'center',
      sortable: true,
      sortingOrder: [ 'asc', 'desc', ],
      sortComparator: (
          value1: string, 
          value2: string, 
          cellParam1: GridSortCellParams,
          cellParam2: GridSortCellParams, 
      ) => {
          const sortingModel: GridSortModel = apiRef.current.getSortModel();
          const columnSortingModel = sortingModel.find((model) => {
              return model.field === 'amount';
          });

          if(parseInt(cellParam1.id.toString()) > 10000 
              || parseInt(cellParam2.id.toString()) > 10000) {
              if(columnSortingModel!.sort === 'asc') {
                  return 1;
              } else {
                  return -1;
              }
          }

          if(value1 && !value2) {
              return 1;
          } else if(!value1 && value2) {
              return -1;
          } else if(!value1 && !value2) {
              return 0;
          }

          if (parseInt(value1) < parseInt(value2)) {
              return -1;
          } else if (parseInt(value1) > parseInt(value2)) {
              return 1;
          } else {
              return 0;
          }
      },
      valueFormatter: (params) => {
               return params.value ? params.value : '0.00';
      },
    },
    {
        field: 'description',
        headerName: 'Description',
        type: 'string',
        editable: true,
        width: 150,
        sortable: false,
    },
    {
      field: 'dateCreated',
      headerName: 'Date created',
      type: 'date',
      editable: false,
      width: 150,
      renderCell: (params) => {
        const row = rows ? rows.find((r) => r.id === params.id) : undefined;

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
      sortable: true,
      sortingOrder: [ 'asc', 'desc', ],
      sortComparator: (
        value1: Date, 
        value2: Date, 
        cellParam1: GridSortCellParams,
        cellParam2: GridSortCellParams, 
      ) => {
          const sortingModel: GridSortModel = apiRef.current.getSortModel();
          const columnSortingModel = sortingModel.find((model) => {
            return model.field === 'dateCreated';
          });

          if(parseInt(cellParam1.id.toString()) > 10000 
            || parseInt(cellParam2.id.toString()) > 10000) {
            if(columnSortingModel!.sort === 'asc') {
              return 1;
            } else {
              return -1;
            }
          }

          if(value1 && !value2) {
            return 1;
          } else if(!value1 && value2) {
            return -1;
          } else if(!value1 && !value2) {
            return 0;
          }

          if (value1.getTime() < value2.getTime()) {
              return -1;
          } else if (value1.getTime() > value2.getTime()) {
              return 1;
          } else {
              return 0;
          }
      },
    },
  ];

  if(!isMobile) {
    columns.push(
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
              ]
          }
        },
      }
    );
  }

  const handleModalClose = () => setShowHistoryModal(false);

  if (showHistoryModal && history) {
    return (
      <Modal
        open={showHistoryModal}
        handleClose={handleModalClose}
        betsHistory={history}
      />
    );
  }

  return (
    <Paper>
      {
        rows
          ? (
              <>
                <Paper style={{ marginLeft: '60%', }}>
                  Total: 
                  {Number(totalOfTotals).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Paper>
                <DataGrid
                  apiRef={apiRef}
                  columns={columns}
                  columnBuffer={2} 
                  columnThreshold={2}
                  onCellKeyDown={tabKeyHandler}
                  rows={rows}   
                  slots={{
                    toolbar: props.displayExportToolbar
                      ? ExpensesToolbar
                      : editToolbar,
                  }}
                  rowModesModel={rowModesModel}
                  processRowUpdate={processRowUpdate}
                  slotProps={{
                    toolbar: { setRows, setRowModesModel, rows },
                  }}
                  
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
                    {'Are you sure you want to delete the expense?'}
                  </DialogTitle>
                  <DialogActions>
                    <Button onClick={handleDeleteClick} autoFocus>Yes</Button>
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
