import * as React from 'react';
import { toast } from 'react-toastify';
import { isMobile } from 'react-device-detect';
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams, 
  GridRenderEditCellParams, GridRowId, GridRowModel, GridRowModes, GridRowModesModel,  
  GridToolbarContainer, GridValueGetterParams } from '@mui/x-data-grid';
import { Autocomplete, Button, CircularProgress, Dialog, DialogActions, DialogTitle, 
  Paper, TextField, Typography, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import CancelIcon from '@mui/icons-material/Close';
import { ActionType, CounteragentModel, EditToolbarProps, IDropdownValue, } from '../../models';
import { deleteCounteragent, getCounterAgents, getCounterAgentsCategories, upsertCounteragent, } from '../../api';
import { Counteragent, CounterAgentCategory, } from '../../database-models';

export default function Counteragents(props: {}) {
  const [ isLoading, setIsLoading, ] = React.useState<boolean>(false);

  const [ rows, setRows] = React.useState<Array<CounteragentModel> | undefined>(undefined);
  const [ rowModesModel, setRowModesModel, ] = React.useState<GridRowModesModel>({});
  const [ deleteRowId, setDeleteRowId, ] = React.useState<number | null>(null);
  const [ deleteDialogIsOpened, setOpenDeleteDialog, ] = React.useState(false);

  const [ possibleCounteragentsCategories, setPossibleCounteragentsCategories ] = 
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
                  ? { id: c.counteragentCategory, label: c.counteragentCategory }
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

        const getCounteragentsCategoriesResult: Array<string> | undefined 
          = await getCounterAgentsCategories();
        const counteragentsCategories: Array<IDropdownValue> = 
          getCounteragentsCategoriesResult
            ? getCounteragentsCategoriesResult.map((counteragentCategory) => {
                return {
                  id: counteragentCategory,
                  label: counteragentCategory
                };
              })
            : [];

        setPossibleCounteragentsCategories(counteragentsCategories);

        //#endregion Counteragent categories


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
    setRows((previousRowsModel: Array<CounteragentModel> | undefined) => {
      if(!previousRowsModel) {
        return [];
      }

      return previousRowsModel.map((row: any) => {
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
    if(!rows) {
      return;
    }

    const canceledRow = rows.find((r) => r.id === id);
    if(!canceledRow) {
      return;
    }

    if(!canceledRow.isSavedInDatabase) {
      setRows((previousRowsModel: Array<CounteragentModel> | undefined) => {
        if(!previousRowsModel) {
          return [];
        }

        return previousRowsModel.filter((row) => {
          return row.id !== id;
        });
      });
    } else {
      setRows((previousRowsModel: Array<CounteragentModel> | undefined) => {
        if(!previousRowsModel) {
          return [];
        }

        return previousRowsModel.map((row) => {
          if(row.id === id) {
            return {
              ...row, 
              actionTypeApplied: ActionType.CANCELED,
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
        return { ...previousRowModesModel, [id]: { mode: GridRowModes.View } }
      });
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRows((previousRowsModel: Array<CounteragentModel> | undefined) => {
      if(!previousRowsModel) {
        return [];
      }

      return previousRowsModel.map((row) => {
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

    setRowModesModel((previousRowModesModel: GridRowModesModel) => {
      let newRowsModel: GridRowModesModel = {};
      if(rows) {
        for(var i = 0; i <= rows.length - 1; i++) {
          newRowsModel[rows[i].id!] = rows[i].id === id
            ? { mode: GridRowModes.Edit }
            : { mode: GridRowModes.View };
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
    if(!rows) {
      return newRow;
    }

    const currentRow = rows.find((row) => row.id === newRow.id);

    if(!currentRow) {
      return newRow;
    }
    
    if(currentRow.actionTypeApplied === ActionType.SAVED
        || currentRow.actionTypeApplied === ActionType.EDITED) {
        const isValidCounterAgentName = newRow.name.split(' ').every((s: string) => {
          return s.match('^[A-Za-z0-9]+$')
        });

        if(!isValidCounterAgentName) {
          // setRowModesModel((previousRowModesModel) => {
          //   return { ...previousRowModesModel, [currentRow.id!]: { mode: GridRowModes.Edit } }
          // });
          toast(`Name should contain only latin characters and digits!`, {
            position: 'top-center',
          });
          
          return newRow;
        }

        if(!newRow.name || !currentRow.counteragentCategory || newRow.maxRate === null) {
          setRowModesModel((previousRowModesModel) => {
            return { ...previousRowModesModel, [currentRow.id!]: { mode: GridRowModes.Edit } }
          });
          toast(`Name, counteragent category, max rate and user should be specified!`, {
            position: 'top-center',
          });
          
          return newRow;
        }

        const newRowData: CounteragentModel = {
          ...currentRow,
          name: newRow.name,
          maxRate: newRow.maxRate,
          dateCreated: currentRow.actionTypeApplied === ActionType.SAVED
            ? new Date()
            : newRow.dateCreated,
          dateChanged: currentRow.actionTypeApplied === ActionType.EDITED
            ? new Date()
            : newRow.dateChanged,
         
        };

        

        setIsLoading(true);
        const loggedUser = JSON.parse(localStorage.getItem('user')!);
        const upsertCounteragentRequestResult = await upsertCounteragent({ 
          ...newRowData,
          user: {
            id: loggedUser.username,
            label: loggedUser.username,
          },
        });

        if(!upsertCounteragentRequestResult || upsertCounteragentRequestResult.status !== 200) {
          setIsLoading(false);

          setRowModesModel((previousRowModesModel) => {
            return { ...previousRowModesModel, [currentRow.id!]: { mode: GridRowModes.Edit } }
          });
          toast(`Some of the parameters are invalid. Please specify valid ones.`, {
            position: 'top-center',
          });
          
          return newRow;
        }

        setRows((previousRowsModel) => {
          return previousRowsModel!.map((row) => {
            if(row.id === newRow.id) {
              return { 
                ...newRowData, 
                isSavedInDatabase: true,
                id: upsertCounteragentRequestResult.data.id,
              };
            } else {
              return row;
            }
          });
        });

        setRowModesModel((previousRowModesModel) => {
          return { ...previousRowModesModel, [upsertCounteragentRequestResult.data.id]: { mode: GridRowModes.View } }
        });

        setIsLoading(false);

        newRow.id = upsertCounteragentRequestResult.data.id;
    } else {
      setRowModesModel((previousRowModesModel) => {
        return { ...previousRowModesModel, [newRow.id]: { mode: GridRowModes.View } }
      });
    }
    
    
    toast(currentRow?.actionTypeApplied === ActionType.CANCELED 
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
      width:220,
      align:'center',
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
            renderInput={(params) => <TextField {...params}
              onBlurCapture={(p) => {
                const value = (p.target as any).value;
                setRows((previousRowsModel) => {
                  return previousRowsModel?.map((r: CounteragentModel) => {
                    if (r.id === row.id) {
                      const counteragentCategory = value
                        ? typeof value === 'string'
                          ? { id: value, label: value }
                          : value
                        : undefined;

                      const isCounteragentCategoryExistsYet 
                        = possibleCounteragentsCategories.some((pC) => {
                          return pC.id === counteragentCategory.id;
                        });

                      if(!isCounteragentCategoryExistsYet) {
                        setPossibleCounteragentsCategories((prevState) => {
                          prevState.push(counteragentCategory);

                          return prevState;
                        })
                      }

                      return {
                        ...row,
                        counteragentCategory,
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
      field: 'maxRate',
      headerName: 'Max rate',
      type: 'number',
      editable: true,
      width: 130,
      align:'center'
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
    },
    {
      field: 'dateChanged',
      headerName: 'Date changed',
      type: 'date',
      editable: false,
      width: 170,
      renderCell: (params) => {
        const row = rows ? rows.find((r) => r.id === params.id) : undefined;

        if (!row) {
         return ''
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
      <CircularProgress color='success' 
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
                    <Button onClick={handleDeleteClick} autoFocus>Yes</Button>
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