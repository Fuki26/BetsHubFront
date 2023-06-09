import * as React from 'react';
import { toast } from 'react-toastify';
import { isMobile } from 'react-device-detect';
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowId, 
  GridRowModel, GridRowModes, GridRowModesModel,  GridToolbarContainer, GridValueGetterParams , } from '@mui/x-data-grid';
import { Autocomplete, Button, Dialog, DialogActions, DialogTitle, Paper, TextField, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import CancelIcon from '@mui/icons-material/Close';
import { EditToolbarProps, Enums, ExpenseModel, IDropdownValue, } from '../../models';
import { deleteExpense, upsertExpense } from '../../api';

export default function Expenses(props: { 
  isRead: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  defaultRows: Array<ExpenseModel> | null;
  possibleCounterAgents: Array<IDropdownValue> | undefined;
}) {
  const { isRead, setIsLoading, defaultRows, possibleCounterAgents, } = props;

  const [ rows, setRows, ] = React.useState<Array<ExpenseModel> | null>(defaultRows);
  const [ rowModesModel, setRowModesModel, ] = React.useState<GridRowModesModel>({});
  const [ deleteRowId, setDeleteRowId, ] = React.useState<number | null>(null);
  const [ deleteDialogIsOpened, setOpenDeleteDialog, ] = React.useState(false);

  React.useEffect(() => {
    setRows((oldRows) => {
      return defaultRows;
    });

    setRowModesModel(() => {
      return {};
    });
  }, [ defaultRows, ]);

  const editToolbar = (props: EditToolbarProps) => {
    const { setRows, setRowModesModel } = props;
  
    if(!possibleCounterAgents || possibleCounterAgents.length === 0) {
      alert('There are not any possible contraagents in the system. You cannot create an expsense.');
      return null;
    }

    const counterAgent = possibleCounterAgents[0];
    const handleAddNewClick = () => {
      const id = Math.round(Math.random() * 1000000);
      setRows((oldRows) => [...oldRows, 
        { 
          id,
          counterAgent: { id: counterAgent.id, label: counterAgent.label, },
          amount: 0,
          description: '',
          dateCreated: new Date(),
      
          actionTypeApplied: undefined,
          isSavedInDatabase: false,
        }
      ]);
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [id]: { mode: GridRowModes.Edit, },
      }));
    };
  
    return !isMobile
      ? (
          <GridToolbarContainer>
            <Button color='primary' variant='contained' startIcon={<AddIcon />} onClick={handleAddNewClick}>
              Create an expense
            </Button>
          </GridToolbarContainer>
        )
      : <></>;
  }


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

  const handleDeleteClick = async () => {
    if(!deleteRowId) {
      return;
    }

    setIsLoading(true);

    await deleteExpense({ id: deleteRowId, });
    setDeleteRowId(null);
    setOpenDeleteDialog(false);

    setRows((previousRows) => previousRows!.filter((row) => row.id !== deleteRowId));
    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [deleteRowId]: { mode: GridRowModes.View } };
    });

    setIsLoading(false);
  };

  //#endregion Actions handlers

  //#region Rows update handler

  const processRowUpdate = async (newRow: GridRowModel) => {
    const currentRow = rows?.find((row) => row.id === newRow.id);
    
    if(currentRow?.actionTypeApplied === Enums.ActionType.SAVED
        || currentRow?.actionTypeApplied === Enums.ActionType.EDITED) {
          const newRowData: ExpenseModel = {
            ...currentRow,
            counterAgent: currentRow.counterAgent,
            amount: newRow.amount,
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
      : `Saved expense with id ${newRow!.id}`,
    {
      position: 'top-center',
    });

    return newRow;
  };

  //#endregion Rows update handler
  
  //#region Dropdown handlers

  // const onChange = (event: any, value: {
  //   rowId: GridRowId | undefined;
  //   value?: string;
  //   label?: string,
  // } | null): void => {
  //   setRows((previousRowsModel) => {
  //     return previousRowsModel!.map((row) => {
  //       if(row.id === value?.rowId) {
  //         return {
  //           ...row, 
  //           counteragentId: parseInt(value.value!),
  //           counteragent: value.label,
  //         };
  //       } else {
  //         return row;
  //       }
  //     });
  //   });
  // }


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
      field: 'counterAgent',
      headerName: 'Counteragent',
      editable: true,
      width: 150,
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
        width: 70,
    },
    {
        field: 'description',
        headerName: 'description',
        type: 'string',
        editable: true,
        width: 150,
    },
    {
        field: 'dateCreated',
        headerName: 'Date created',
        type: 'date',
        editable: false,
        width: 100,
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

  return (
    <Paper sx={{ padding: '5%', }}>
      {
        rows
          ? (
              <>
                <DataGrid
                  columns={columns}
                  columnBuffer={2} 
                  columnThreshold={2}
                  rows={rows}   
                  slots={{
                    toolbar: isRead
                      ? undefined
                      : editToolbar,
                  }}
                  rowModesModel={rowModesModel}
                  processRowUpdate={processRowUpdate}
                  slotProps={{
                    toolbar: { setRows, setRowModesModel },
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