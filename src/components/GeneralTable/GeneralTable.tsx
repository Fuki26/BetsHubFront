import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import CancelIcon from '@mui/icons-material/Close';
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGridPro,
  GridColDef,
  GridRowParams,
  MuiEvent,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowSelectionModel,
} from '@mui/x-data-grid-pro';
import { Dialog, DialogActions, DialogTitle } from '@mui/material';

function takeUniqueId() {
  const randomNumber = Math.random() * 1000000;
  return randomNumber;
}

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
  ) => void;
}

function EditToolbar(props: EditToolbarProps) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = Math.round(takeUniqueId());
    setRows((oldRows) => [...oldRows, 
      { 
        id, 
        dateCreated: new Date(),  
        counteragentId: 0, 
        sport: 0, 
        marketId: 0,
        stakeValue: 0,
        liveStatus: 0,
        psLimit: 0,
        tournamentId: 0,
        selectionId: 0,
        amount: 0,
        odd: 0,
        dateFinished: new Date(),
        totalAmount: 0,

        savedInDatabase: false,
        isCanceled: false,
        parentId: null,
        clickedForChildren: false,
      }
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" variant="contained" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  );
}

export default function GeneralTable<T extends { 
    id: number; 
    savedInDatabase: boolean;
    isCanceled: boolean;
    parentId: number | null;
    clickedForChildren: boolean;
  }>(props: {
  initialRows: Array<T>,
  columns: Array<GridColDef>
}) {
  const { initialRows, columns, } = props;
  const [rows, setRows] = React.useState<Array<T> | null>(null);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const [ deleteRowId, setDeleteRowId ] = React.useState<string | number | null>(null);

  React.useEffect(() => {
    setRows(initialRows);
  }, []);

  const [deleteDialogIsOpened, setOpenDeleteDialog] = React.useState(false);

  const handleClickOpenOnDeleteDialog = (id: GridRowId) => () => {
    setDeleteRowId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseOnDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleRowEditStart = (
    params: GridRowParams,
    event: MuiEvent<React.SyntheticEvent>,
  ) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [id]: { mode: GridRowModes.Edit } };
    });
  };

  const handleDeleteClick = () => {
    if(!deleteRowId) {
      return;
    }

    setOpenDeleteDialog(false);

    setRows((previousRows) => previousRows!.filter((row) => row.id !== deleteRowId));
    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [deleteRowId]: { mode: GridRowModes.View } };
    });
  };

  const handleClickAddChildren = (id: GridRowId) => () => {
    setRows((previousRows) => {
      return previousRows!.map((row) => {
        if(row.id === id) {
          return {
            ...row,
            clickedForChildren: true,
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

  const handleClickRemoveChildren = (id: GridRowId) => () => {
    setRows((previousRows) => {
      return previousRows!.filter((row) => {
        if(row.parentId && row.parentId === id) {
          return false;
        } else {
          return true;
        }
      });
    });

    setRows((previousRows) => {
      return previousRows!.map((row) => {
        if(row.id === id) {
          return {
            ...row,
            isCanceled: true,
          };
        } else {
          return row;
        }
      });
    });

    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [id]: { mode: GridRowModes.Edit } }
    });
  };

  //#region Add/Edit mode

  const handleSaveClick = (id: GridRowId) => () => {
    setRows((previousRows) => {
      return previousRows!.map((row) => {
        if(row.id === id) {
          return {
            ...row,
            canceled: false,
          };
        } else {
          return row;
        }
      });
    });

    const childrenIds: Array<number> | undefined 
      = rows?.filter((row) => row.parentId === id).map((row) => row.id);

    setRowModesModel((previousRowModesModel) => {
      let childrenData: any = {};
      childrenData[id] = { mode: GridRowModes.View };
      if(childrenIds) {
        for(var i = 0; i <= childrenIds?.length - 1; i++) {
          childrenData[childrenIds[i]] = { mode: GridRowModes.View };
        }
      }
      
      return { ...previousRowModesModel, ...childrenData};
    });
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRows((previousRows) => {
      return previousRows!.map((row) => {
        if(row.id === id) {
          return {
            ...row,
            canceled: true,
          };
        } else {
          return row;
        }
      });
    });

    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [id]: { mode: GridRowModes.View } }
    });

    const editedRow = rows?.find((row) => row.id === id);
    if (!editedRow?.savedInDatabase) {
      setRows((previousRows) => previousRows!.filter((row) => {
        if(row.parentId) {
          return row.id !== id && row.parentId !== id;
        } else {
          return row.id !== id;
        } 
      }));
    }
  };

  //#endregion  Add/Edit mode

  const processRowUpdate = (newRow: GridRowModel) => {
    if(newRow.canceled) {
      return newRow;
    }

    if(newRow.clickedForChildren) {
      const id1 = Math.round(takeUniqueId());
      const id2 = Math.round(takeUniqueId());
      const id3 = Math.round(takeUniqueId());

      setRows((oldRows) => {
        const newRows = [
          { ...newRow, ...{ id: id1, isCanceled: false, parentId: newRow.id, savedInDatabase: false, 
            clickedForChildren: false, } as T },
          { ...newRow, ...{ id: id2, isCanceled: false, parentId: newRow.id, savedInDatabase: false, 
            clickedForChildren: false, } as T },
          { ...newRow, ...{ id: id3, isCanceled: false, parentId: newRow.id, savedInDatabase: false, 
            clickedForChildren: false, } as T },  
        ];

        return oldRows
          ? [...oldRows.map((row) => {
              if(row.id === newRow.id) {
                return {
                  ...row,
                  isCanceled: false,
                  parentId: null,
                  clickedForChildren: false,
                }
              } else {
                return row;
              }
            }), ...newRows]
          : [...newRows];
      });

      setRowModesModel((oldModel) => ({
        ...oldModel,
        ...{
          [id1]: { mode: GridRowModes.Edit, },
          [id2]: { mode: GridRowModes.Edit, },
          [id3]: { mode: GridRowModes.Edit, },
        },
      }));
    } else {
      setRowModesModel((previousRowModesModel) => {
        return { ...previousRowModesModel, [newRow.id]: { mode: GridRowModes.View } }
      });
    }

    return newRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  let columnsWithActions = columns.concat({
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 100,
    cellClassName: 'actions',
    getActions: (params) => {
      const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit;
      const row = rows?.find((row) => row.id === params.id);
      if(row?.parentId) {
        return [];
      }

      const hasRenderedChildren = rows?.some((r) => {
        return r.parentId === row?.id;
      });

      console.log(`id = ${row?.id}, isInEditMode: ${isInEditMode}, hasRenderedChildren = ${hasRenderedChildren}, savedInDatabase = ${row?.savedInDatabase}, isCanceled = ${row?.isCanceled}, parentId = ${row?.parentId}, clickedForChildren = ${row?.clickedForChildren}`);

      if (!row?.savedInDatabase) {
        const addOrRemoveChildrenIcon = hasRenderedChildren
          ? (
              <GridActionsCellItem
                icon={<RemoveIcon />}
                label="Outline"
                onClick={handleClickRemoveChildren(params.id)}
              />
            )
          : (
              <GridActionsCellItem
                icon={<AddCircleOutlineIcon />}
                label="Outline"
                onClick={handleClickAddChildren(params.id)}
              />
            );

        return [
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
          addOrRemoveChildrenIcon
        ];
      } else {
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
            ]
      }
    },
  });

  return (
    <Box
      sx={{
        height: 700,
        width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
        },
      }}
    >
      {
        rows && columnsWithActions
          ? (
            <>
              <DataGridPro
                rows={rows}
                columns={columnsWithActions}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowSelectionModelChange={(rowSelectionModel: GridRowSelectionModel, ) => {
                  alert(JSON.stringify(rowSelectionModel));
                }}
                onRowEditStart={handleRowEditStart}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                disableMultipleRowSelection={true}
                slots={{
                  toolbar: EditToolbar,
                }}
                slotProps={{
                  toolbar: { setRows, setRowModesModel },
                }}
              />
              <Dialog
                open={deleteDialogIsOpened}
                onClose={handleCloseOnDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  {"Are you sure you want to delete the row?"}
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
      
    </Box>
  );
}