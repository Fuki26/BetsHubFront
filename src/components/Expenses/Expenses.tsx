import * as React from 'react';
import { toast } from 'react-toastify';
import { DataGridPro, GridActionsCellItem, GridColDef,
  GridRowId, GridRowModel, GridRowModes, 
  GridRowModesModel, GridRowParams, GridRowsProp, GridToolbarContainer, 
  GridValidRowModel, } from '@mui/x-data-grid-pro';
import { Button, Dialog, DialogActions, DialogTitle, Paper, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import CancelIcon from '@mui/icons-material/Close';
import { EditToolbarProps, Enums, ExpenseModel, } from '../../models';
import FreeSoloCreateOption from '../Dropdown/FreeSoloCreateOptionDialog';
// import { deleteExpense, } from '../../api';
import { ItemTypes } from '../../models/enums';
import { upsertExpense } from '../../api';

export default function Expenses(props: { 
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  defaultRows: Array<ExpenseModel> | null;
  possibleCounteragents: Array<{ id: number; name: string; }> | undefined;
}) {
  const { setIsLoading, defaultRows, possibleCounteragents, } = props;

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
          counteragentId: contraagent.id,
          counteragent: contraagent.name,
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

    setIsLoading(true);

    // await deleteExpense({ id: deleteRowId, });
    setDeleteRowId(null);
    setOpenDeleteDialog(false);

    setRows((previousRows) => previousRows!.filter((row) => row.id !== deleteRowId));
    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [deleteRowId]: { mode: GridRowModes.View } };
    });

    setIsLoading(false);
  };

  const onRowClick = (params: GridRowParams) => {
    const row = rows!.find((row) => row.id === params.id);
    if(row) {
      setRowModesModel((previousRowModesModel) => {
        return { ...previousRowModesModel, [row.id]: { mode: GridRowModes.Edit } }
      });
    }
  }

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

  const onClick = (props: { id: number; }) => {
    const { id, } = props;

    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [id]: { mode: GridRowModes.Edit } }
    });
  }

  const onChangeCb = (props: { 
        expenseId?: number; 
        itemType: ItemTypes; 
        id?: string; 
        label: string; 
    }): void => {
    const { expenseId, itemType, id, label, } = props;
    setRows((previousRowsModel) => {
      return previousRowsModel!.map((row) => {
        if(row.id === expenseId) {
          switch(itemType) {
            case ItemTypes.COUNTERAGENT: {
              const counteragent = possibleCounteragents?.find((c: { id: number; name: string; }) => {
                return parseInt(id!) === c.id;
              });

              if(!counteragent) {
                return row;
              }

              return {
                ...row, 
                counteragentId: counteragent?.id,
                counteragent: counteragent?.name,
              };
            };
          }
        }
          
        return row;
      });
    });
  }

  const onAddNewValueCb = (props: { 
        expenseId?: number; 
        itemType: ItemTypes; 
        inputValue: string; 
    }): void => {
    const { expenseId, itemType, inputValue, } = props;
    setRows((previousRowsModel) => {
      return previousRowsModel!.map((row) => {
        if(row.id === expenseId) {
          switch(itemType) {
            case ItemTypes.COUNTERAGENT: {
              return {
                ...row, 
                counteragentId: undefined,
                counteragent: inputValue,
              };
            };
          }
        }
          
        return row;
      });
    });
  }

  const onCounteragentRender = (params: GridValidRowModel) => {
    const row = rows?.find((r) => r.id === params.id);
    if(!row || !possibleCounteragents) {
      return;
    }

    return (
      <>
        <FreeSoloCreateOption 
          betId={params.id}
          items={
            possibleCounteragents.map((counteragent: { id: number; name: string; }) => {
              return {
                id: counteragent.id.toString(),
                label: counteragent.name,
                inputValue: '', 
              };
            })
          }
          defaultValue={
            row.counteragentId && row.counteragent
              ? { id: row.counteragentId.toString(), label: row.counteragent, inputValue: '', }
              : null
          }
          itemType={ItemTypes.COUNTERAGENT}
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
        field: 'counteragent',
        headerName: 'counteragent',
        type: 'singleSelect',
        editable: true,
        width: 300,
        renderCell: onCounteragentRender,
        renderEditCell: onCounteragentRender,
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
        editable: true,
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
                    toolbar: editToolbar,
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