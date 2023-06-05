import * as React from 'react';
import { toast } from 'react-toastify';
import { DataGridPro, GridActionsCellItem, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowId, 
  GridRowModel, GridRowModes, GridRowModesModel,  GridToolbarContainer , } from '@mui/x-data-grid-pro';
import { Autocomplete, Button, Dialog, DialogActions, DialogTitle, Paper, TextField, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import CancelIcon from '@mui/icons-material/Close';
import { EditToolbarProps, Enums, ExpenseModel, } from '../../models';
// import { deleteExpense, } from '../../api';
import { ItemTypes } from '../../models/enums';
import { deleteExpense, upsertExpense } from '../../api';

export default function Expenses(props: { 
  isRead: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  defaultRows: Array<ExpenseModel> | null;
  possibleCounteragents: Array<{ value: string; label: string; }> | undefined;
}) {
  const { isRead, setIsLoading, defaultRows, possibleCounteragents, } = props;

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
  
    if(!possibleCounteragents || possibleCounteragents.length === 0) {
      alert('There are not any possible contraagents in the system. You cannot create an expsense.');
      return null;
    }

    const contraagent = possibleCounteragents[0];
    const handleAddNewClick = () => {
      const id = Math.round(Math.random() * 1000000);
      setRows((oldRows) => [...oldRows, 
        { 
          id,
          counteragentId: parseInt(contraagent.value),
          counteragent: contraagent.label,
          amount: 0,
          description: '',
          dateCreated: new Date(),
          dateFrom: new Date(),
          dateTo: new Date(),
      
          actionTypeApplied: undefined,
          isSavedInDatabase: false,
        } as ExpenseModel
      ]);
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [id]: { mode: GridRowModes.Edit, },
      }));
    };
  
    return (
      <GridToolbarContainer>
        <Button color='primary' variant='contained' startIcon={<AddIcon />} onClick={handleAddNewClick}>
          Create an expense
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
    
    toast(currentRow?.actionTypeApplied === Enums.ActionType.CANCELED 
        ? 'Canceled' 
        : `Saved expense with id ${currentRow!.id}`,
      {
        position: 'top-center',
      });
    if(currentRow?.actionTypeApplied === Enums.ActionType.SAVED
        || currentRow?.actionTypeApplied === Enums.ActionType.EDITED) {
          const newRowData: ExpenseModel = {
            ...currentRow,
            counteragentId: newRow.counteragentId,
            counteragent: currentRow.counteragent,
            amount: newRow.amount,
            description: newRow.description,
            dateCreated: newRow.dateCreated,
            dateFrom: newRow.dateFrom,
            dateTo: newRow.dateTo,
          };

          setIsLoading(true);
          
          await upsertExpense(newRowData);

          setRows((previousRowsModel) => {
            return previousRowsModel!.map((row) => {
              if(row.id === newRow.id) {
                return newRowData;
              } else {
                return row;
              }
            });
          });

          setIsLoading(false);
    } else {

    }
    
    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [newRow.id]: { mode: GridRowModes.View } }
    });

    return newRow;
  };

  //#endregion Rows update handler
  
  //#region Dropdown handlers

  const onChange = (event: any, value: {
    rowId: GridRowId | undefined;
    value?: string;
    label?: string,
  } | null): void => {
    setRows((previousRowsModel) => {
      return previousRowsModel!.map((row) => {
        if(row.id === value?.rowId) {
          return {
            ...row, 
            counteragentId: parseInt(value.value!),
            counteragent: value.label,
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
    },
    {
        field: 'counteragent',
        headerName: 'counteragent',
        type: 'singleSelect',
        editable: true,
        width: 300,
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
            ? rows?.find((r) => r.id === params.id)
            : undefined;
  
          if(!row) {
            throw Error(`Row did not found.`);
          }
  
          return (
            <Autocomplete
              options={
                possibleCounteragents
                  ? possibleCounteragents.map((counteragent) => {
                    return {
                          rowId: params.id,
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
                row.counteragentId && row.counteragent
                  ? {
                      rowId: params.id,
                      value: row.counteragentId.toString(),
                      label: row.counteragent,
                    }
                  : {
                      rowId: params.id,
                      value: '',
                      label: '',
                    }
              }
            />
          )
        }
    },
    {
        field: 'amount',
        headerName: 'amount',
        type: 'number',
        editable: true,
        width: 150,
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
        headerName: 'dateCreated',
        type: 'date',
        editable: false,
        width: 150,
    },
    {
        field: 'dateFrom',
        headerName: 'dateFrom',
        type: 'date',
        editable: true,
        width: 150,
    },
    {
        field: 'dateTo',
        headerName: 'dateTo',
        type: 'date',
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
  ];

  return (
    <Paper sx={{ padding: '5%', }}>
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
                      : editToolbar,
                  }}
                  rowModesModel={rowModesModel}
                  processRowUpdate={processRowUpdate}
                  slotProps={{
                    toolbar: { setRows, setRowModesModel },
                  }}
                  editMode='row'
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