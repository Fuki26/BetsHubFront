import * as React from 'react';
import { toast } from 'react-toastify';
import { DataGridPro, GridActionsCellItem, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowId, 
  GridRowModel, GridRowModes, GridRowModesModel,  GridToolbarContainer , } from '@mui/x-data-grid-pro';
import { Autocomplete, Button, CircularProgress, Dialog, DialogActions, DialogTitle, Paper, TextField, Typography, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import CancelIcon from '@mui/icons-material/Close';
import { CounteragentModel, EditToolbarProps, Enums, } from '../../models';
import { ItemTypes } from '../../models/enums';
import { deleteCounteragent, getCounteragents, getCounteragentsCategories, getUsers, upsertCounteragent, } from '../../api';
import { Counteragent, CounterAgentCategory, User } from '../../database-models';

export default function Counteragents(props: {}) {
  const [ isLoading, setIsLoading, ] = React.useState<boolean>(false);

  const [ rows, setRows] = React.useState<Array<CounteragentModel> | undefined>(undefined);
  const [ possibleCounteragentsCategories, setPossibleCounteragentsCategories ] = 
    React.useState<Array<{ value: string; label: string; }> | undefined>(undefined);
  const [ possibleUsers, setPossibleUsers ] = 
    React.useState<Array<{ value: string; label: string; }> | undefined>(undefined);
  const [ rowModesModel, setRowModesModel, ] = React.useState<GridRowModesModel>({});
  const [ deleteRowId, setDeleteRowId, ] = React.useState<number | null>(null);
  const [ deleteDialogIsOpened, setOpenDeleteDialog, ] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const counteragentsDatabaseModels: Array<Counteragent> | undefined 
          = await getCounteragents();
        let counteragents: Array<CounteragentModel> = counteragentsDatabaseModels
          ? counteragentsDatabaseModels.map((c: Counteragent) => {
              return {
                id: c.id,
                name: c.name,
                counteragentCategoryId: c.counteragentCategoryId,
                counteragentCategory: c.counteragentCategory && c.counteragentCategory.name
                  ? c.counteragentCategory.name
                  : '',
                maxRate: c.maxRate,
                dateCreated: new Date(c.dateCreated),
                dateChanged: new Date(c.dateChanged),
                userId: c.userId,
                user: c.user && c.user.userName
                  ? c.user.userName
                  : '',

                actionTypeApplied: undefined,
                isSavedInDatabase: true,
              };
            })
          : [];

        const getCounteragentsCategoriesResult = await getCounteragentsCategories();
        const getUsersResult = await getUsers();

        const counteragentsCategories: Array<{ value: string; label: string; }> | undefined = 
          getCounteragentsCategoriesResult
            ? getCounteragentsCategoriesResult.map((counteragentCategory: CounterAgentCategory) => {
                return {
                  value: counteragentCategory.id.toString(),
                  label: counteragentCategory.name
                    ? counteragentCategory.name
                    : '',
                };
              })
            : [];
        
        const users: Array<{ value: string; label: string; }> | undefined = 
          getUsersResult
            ? getUsersResult.map((user: User) => {
                return {
                  value: user.id.toString(),
                  label: user.userName
                    ? user.userName
                    : '',
                };
              })
            : [];

        setRows(counteragents);
        setPossibleCounteragentsCategories(counteragentsCategories);
        setPossibleUsers(users);

        setIsLoading(false);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const editToolbar = (props: EditToolbarProps) => {
    const { setRows, setRowModesModel } = props;

    const counteragentCategory = !possibleCounteragentsCategories || possibleCounteragentsCategories.length === 0
      ? {
          value: '',
          label: ''
        } 
      : possibleCounteragentsCategories[0];

    const user = !possibleUsers || possibleUsers.length === 0
      ? {
          value: '',
          label: ''
        } 
      : possibleUsers[0];
    const handleAddNewClick = () => {
      const id = Math.round(Math.random() * 1000000);
      setRows((oldRows) => [...oldRows, 
        { 
          id,
          name: '',
          counteragentCategory: counteragentCategory.label,
          maxRate: 0,
          dateCreated: new Date(),
          dateChanged: new Date(),
          user: user.label,
      
          actionTypeApplied: undefined,
          isSavedInDatabase: false,
        } as CounteragentModel
      ]);

      setRowModesModel((oldModel) => ({
        ...oldModel,
        [id]: { mode: GridRowModes.Edit, },
      }));
    };
  
    return (
      <GridToolbarContainer>
        <Button color='primary' variant='contained' startIcon={<AddIcon />} onClick={handleAddNewClick}>
          Create a counteragent
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
    setRows((previousRowsModel: any) => {
      return previousRowsModel!.map((row: any) => {
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
          newRowsModel[currentRow.id!] = { mode: GridRowModes.View };
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

    await deleteCounteragent({ id: deleteRowId, });
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
        const newRowData: CounteragentModel = {
          ...currentRow,
          name: newRow.name,
          counteragentCategoryId: newRow.counteragentCategoryId, 
          counteragentCategory: currentRow.counteragentCategory,
          maxRate: newRow.maxRate,
          dateCreated: currentRow.actionTypeApplied === Enums.ActionType.SAVED
            ? new Date()
            : newRow.dateCreated,
          dateChanged: currentRow.actionTypeApplied === Enums.ActionType.EDITED
            ? new Date()
            : newRow.dateChanged,
          userId: newRow.userId, 
          user: currentRow.user,
        };

        setIsLoading(true);
        
        const rowData = await upsertCounteragent(newRowData);

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
      : `Saved counteragent with id ${newRow!.id}`,
    {
      position: 'top-center',
    });

    return newRow;
  };

  //#endregion Rows update handler
  
  //#region Dropdown handlers

  const onCounterAgentCategoryChange = (event: any, value: {
    rowId: GridRowId | undefined;
    value?: string;
    label?: string,
  } | null): void => {
    if(!value || !value.value || !value.label) {
      alert(`Provided value from dropdown is ${JSON.stringify(value)}. The dropdown value cannot be set.`);
      return;
    }

    setRows((previousRowsModel) => {
      if(!previousRowsModel) {
        return [];
      }

      return previousRowsModel.map((row) => {
        const isValidId = !value.value || isNaN(parseInt(value.value))
          ? false
          : true;
        if(!isValidId) {
          alert(`Provided value from dropdown is ${JSON.stringify(value)}. The dropdown value cannot be set.`);
          return row;
        }

        if(row.id === value.rowId) {
          return {
            ...row, 
            counteragentCategoryId: parseInt(value.value!),
            counteragentCategory: value.label!,
          };
        } else {
          return row;
        }
      });
    });
  }

  const onUserChange = (event: any, value: {
    rowId: GridRowId | undefined;
    value?: string;
    label?: string,
  } | null): void => {
    if(!value || !value.value || !value.label) {
      alert(`Provided value from dropdown is ${JSON.stringify(value)}. The dropdown value cannot be set.`);
      return;
    }

    setRows((previousRowsModel) => {
      return previousRowsModel!.map((row) => {
        if(row.id === value.rowId) {
          return {
            ...row, 
            userId: value.value!,
            user: value.label!,
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
      field: 'name',
      headerName: 'Name',
      type: 'string',
      editable: true,
      width: 150,
    },
    {
      field: 'counteragentCategory',
      headerName: 'Counteragent category',
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
            {row.counteragentCategory}
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
            options={
              possibleCounteragentsCategories
                ? possibleCounteragentsCategories.map((counteragentCategory) => {
                  return {
                        rowId: params.id,
                        value: counteragentCategory.value, 
                        label: counteragentCategory.label, 
                      };
                  })
                : []
            }       
            sx={{ width: 300 }}
            renderInput={(params: any) => <TextField {...params} 
              label={ItemTypes.COUNTERAGENT} />}
            onChange={onCounterAgentCategoryChange}
            value={
              row.counteragentCategoryId && row.counteragentCategory
                ? {
                    rowId: params.id,
                    value: row.counteragentCategoryId.toString(),
                    label: row.counteragentCategory,
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
      field: 'maxRate',
      headerName: 'Max rate',
      type: 'number',
      editable: true,
      width: 150,
    },
    {
      field: 'dateCreated',
      headerName: 'Date created',
      type: 'date',
      editable: false,
      width: 150,
    },
    {
      field: 'dateChanged',
      headerName: 'Date changed',
      type: 'date',
      editable: false,
      width: 150,
    },
    {
      field: 'user',
      headerName: 'User',
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
            {row.user}
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
            options={
              possibleUsers
                ? possibleUsers.map((user) => {
                  return {
                        rowId: params.id,
                        value: user.value, 
                        label: user.label, 
                      };
                  })
                : []
            }       
            sx={{ width: 300 }}
            renderInput={(params: any) => <TextField {...params} 
              label={ItemTypes.USER} />}
            onChange={onUserChange}
            value={
              row.userId && row.user
                ? {
                    rowId: params.id,
                    value: row.userId.toString(),
                    label: row.user,
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
      <Typography variant='h3'>Counteragents</Typography>
      {
        isLoading
          ? (
              <>
                <CircularProgress color="success" 
                  size={250}
                  disableShrink={true}
                  style={{
                    position: 'fixed', 
                    top: '40%', 
                    right: '50%', 
                    zIndex: 9999999999999,
                    transition: 'none',
                  }}

                />
              </>
              
            )
          : null
      }
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
                    toolbar: editToolbar,
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
                    {'Are you sure you want to delete the counteragent?'}
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