import * as React from 'react';
import { toast } from 'react-toastify';
import { isMobile } from 'react-device-detect';
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowId, 
  GridRowModel, GridRowModes, GridRowModesModel,  GridToolbarContainer, GridValueGetterParams , } from '@mui/x-data-grid';
import { Autocomplete, Button, CircularProgress, Dialog, DialogActions, DialogTitle, Paper, TextField, Typography, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import CancelIcon from '@mui/icons-material/Close';
import { CounteragentModel, EditToolbarProps, Enums, IDropdownValue, } from '../../models';
import { deleteCounteragent, getCounterAgents, getCounterAgentsCategories, getUsers, upsertCounteragent, } from '../../api';
import { Counteragent, CounterAgentCategory, User } from '../../database-models';

export default function Counteragents(props: {}) {
  const [ isLoading, setIsLoading, ] = React.useState<boolean>(false);

  const [ rows, setRows] = React.useState<Array<CounteragentModel> | undefined>(undefined);
  const [ rowModesModel, setRowModesModel, ] = React.useState<GridRowModesModel>({});
  const [ deleteRowId, setDeleteRowId, ] = React.useState<number | null>(null);
  const [ deleteDialogIsOpened, setOpenDeleteDialog, ] = React.useState(false);

  const [ possibleCounteragentsCategories, setPossibleCounteragentsCategories ] = 
    React.useState<Array<IDropdownValue>>([]);
  const [ possibleUsers, setPossibleUsers ] = 
    React.useState<Array<IDropdownValue>>([]);
  
  React.useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        //#region Counteragents

        const counteragentsDatabaseModels: Array<Counteragent> | undefined 
          = await getCounterAgents();
        let counteragents: Array<CounteragentModel> = counteragentsDatabaseModels
          ? counteragentsDatabaseModels.map((c: Counteragent) => {
              return {
                id: c.id,
                name: c.name,
                counteragentCategory: c.counteragentCategory
                  ? { id: c.counteragentCategory.id.toString(), label: c.counteragentCategory.name! }
                  : undefined,
                user: c.user
                  ? { id: c.user.id, label: c.user.userName! }
                  : undefined,
                maxRate: c.maxRate,
                dateCreated: new Date(c.dateCreated),
                dateChanged: new Date(c.dateChanged),
                
                actionTypeApplied: undefined,
                isSavedInDatabase: true,
              };
            })
          : [];
        
        setRows(counteragents);

        //#endregion Counteragents

        //#region Counteragent categories

        const getCounteragentsCategoriesResult = await getCounterAgentsCategories();
        const counteragentsCategories: Array<IDropdownValue> = 
          getCounteragentsCategoriesResult
            ? getCounteragentsCategoriesResult.map((counteragentCategory: CounterAgentCategory) => {
                return {
                  id: counteragentCategory.id.toString(),
                  label: counteragentCategory.name!
                };
              })
            : [];

        setPossibleCounteragentsCategories(counteragentsCategories);

        //#endregion Counteragent categories
        
        //#region Users

        const getUsersResult = await getUsers();
        const users: Array<IDropdownValue> = 
          getUsersResult
            ? getUsersResult.map((user: User) => {
                return {
                  id: user.id,
                  label: user.userName!,
                };
              })
            : [];

        
        setPossibleUsers(users);

        //#endregion Users

        setIsLoading(false);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const editToolbar = (props: EditToolbarProps) => {
    const { setRows, setRowModesModel } = props;

    const handleAddNewClick = () => {
      const id = Math.round(Math.random() * 1000000);
      setRows((oldRows) => [
        { 
          id,
          name: '',
          counteragentCategory: undefined,
          user: undefined,
          maxRate: 0,
          dateCreated: new Date(),
          dateChanged: new Date(),
          
          actionTypeApplied: undefined,
          isSavedInDatabase: false,
        } as CounteragentModel,
        ...oldRows
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
              Create a counteragent
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
          counteragentCategory: currentRow.counteragentCategory,
          user: currentRow.user,
          maxRate: newRow.maxRate,
          dateCreated: currentRow.actionTypeApplied === Enums.ActionType.SAVED
            ? new Date()
            : newRow.dateCreated,
          dateChanged: currentRow.actionTypeApplied === Enums.ActionType.EDITED
            ? new Date()
            : newRow.dateChanged,
         
        };

        if(!newRowData.name
          || !newRowData.counteragentCategory
          || !newRowData.user
          || newRowData.maxRate === null) {
          setRowModesModel((previousRowModesModel) => {
            return { ...previousRowModesModel, [currentRow.id!.toString()]: { mode: GridRowModes.Edit } }
          });
          toast(`Name, counteragent category, max rate and user should be specified!`, {
            position: 'top-center',
          });
          
          return;
        }

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
      field: 'name',
      headerName: 'Name',
      type: 'string',
      editable: true,
      width: 120,
    },
    {
      field: 'counteragentCategory',
      headerName: 'Counteragent category',
      editable: true,
      width:150,
      renderCell: (params: GridRenderCellParams<CounteragentModel>) => {
        const row = rows?.find((r) => r.id === params.row.id);
        if(!row) {
          return;
        }

        return (
          <>
            {
              row.counteragentCategory 
                ? row.counteragentCategory.label
                : ''
            }
          </>
        );
      },
      renderEditCell: (params: GridRenderEditCellParams<CounteragentModel>) => {
        const row = rows?.find((r) => r.id === params.row.id);
        if(!row) {
          return;
        }

        return (
          <Autocomplete
            // freeSolo
            options={
              possibleCounteragentsCategories
                ? possibleCounteragentsCategories
                : []
            }
            renderInput={(params) => 
              <TextField {...params}/>
            }
            onChange={(e, value: any) => {
              setRows((previousRowsModel) => {
                return previousRowsModel?.map((row: CounteragentModel) => {
                  if(row.id === params.row.id) {
                    return {
                      ...row, 
                      counteragentCategory: value
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
            value={row.counteragentCategory}
            sx={{
              width: 300,
            }}
          />
        );
      },
      valueGetter: (params: GridValueGetterParams<CounteragentModel>) => {
        const row = rows?.find((r) => r.id === params.row.id);
        if(!row) {
          return;
        }

        return row.counteragentCategory;
      },
    },
    {
      field: 'user',
      headerName: 'User',
      editable: true,
      width: 150,
      renderCell: (params: GridRenderCellParams<CounteragentModel>) => {
        const row = rows?.find((r) => r.id === params.row.id);
        if(!row) {
          return;
        }

        return (
          <>
            {
              row.user 
                ? row.user.label
                : ''
            }
          </>
        );
      },
      renderEditCell: (params: GridRenderEditCellParams<CounteragentModel>) => {
        const row = rows?.find((r) => r.id === params.row.id);
        if(!row) {
          return;
        }

        return (
          <Autocomplete
            // freeSolo
            options={
              possibleUsers
                ? possibleUsers
                : []
            }
            renderInput={(params) => 
              <TextField {...params}/>
            }
            onChange={(e, value: any) => {
              setRows((previousRowsModel) => {
                return previousRowsModel?.map((row: CounteragentModel) => {
                  if(row.id === params.row.id) {
                    return {
                      ...row, 
                      user: value
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
            value={row.user}
            sx={{
              width: 300,
            }}
          />
        );
      },
      valueGetter: (params: GridValueGetterParams<CounteragentModel>) => {
        const row = rows?.find((r) => r.id === params.row.id);
        if(!row) {
          return;
        }

        return row.user;
      },
    },
    {
      field: 'maxRate',
      headerName: 'Max rate',
      type: 'number',
      editable: true,
      width: 70,
    },
    {
      field: 'dateCreated',
      headerName: 'Date created',
      type: 'date',
      editable: false,
      width: 120,
    },
    {
      field: 'dateChanged',
      headerName: 'Date changed',
      type: 'date',
      editable: false,
      width: 120,
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
    );
  }

  return (
    <>
    {
  isLoading
    ? (
      <>
      <div className='background-color-blur'>
      <CircularProgress color="success" 
          size={250}
          disableShrink={true}
          style={{
            position: 'fixed', 
            top: '0', 
            right: '0',
            bottom: '0',
            left: '0',
            margin: 'auto',
            zIndex: 9999999999999,
            transition: 'none',
          }}
        />
      </div>
      </>
    )
  : null
}

    <Paper sx={{ padding: '5%', }}>
      <Typography variant='h3'>Counteragents</Typography>
     
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

    </>
    
  );
}