import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
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
} from '@mui/x-data-grid-pro';
import {
  randomId,
} from '@mui/x-data-grid-generator';
import { Dialog, DialogActions, DialogTitle } from '@mui/material';
import { GeneralBet } from '../../models';

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
    const id = randomId();
    setRows((oldRows) => [...oldRows, { id, name: '', age: '', isNew: true }]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
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

export default function FullFeaturedCrudGrid(props: {
  initialRows: GridRowsProp,
  columns: Array<GridColDef>
}) {
  const { initialRows, columns, } = props;
  const [rows, setRows] = React.useState<GridRowsProp | null>(null);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  // const [ deleteRowId, setDeleteRowId ] = React.useState<string | number | null>(null);

  React.useEffect(() => {
    setRows(initialRows);
  }, []);

  // const [deleteDialogIsOpened, setOpenDeleteDialog] = React.useState(false);

  // const handleClickOpenOnDeleteDialog = (id: GridRowId) => () => {
  //   setDeleteRowId(id);
  //   setOpenDeleteDialog(true);
  // };

  // const handleCloseOnDeleteDialog = () => {
  //   setOpenDeleteDialog(false);
  // };

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

  // const handleDeleteClick = () => {
  //   if(!deleteRowId) {
  //     return;
  //   }

  //   setOpenDeleteDialog(false);

  //   setRows((previousRows) => previousRows!.filter((row) => row.id !== deleteRowId));
  //   setRowModesModel((previousRowModesModel) => {
  //     return { ...previousRowModesModel, [deleteRowId]: { mode: GridRowModes.View } };
  //   });
  // };

  // const handleClickAddChildren = (id: GridRowId) => () => {
  // };

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

    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [id]: { mode: GridRowModes.View } }
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

    const editedRow = rows!.find((row) => row.id === id);
    if (!editedRow!.savedInDatabase) {
      setRows((previousRows) => previousRows!.filter((row) => row.id !== id));
    }
  };

  //#endregion  Add/Edit mode

  const processRowUpdate = (newRow: GridRowModel) => {
    if(newRow.canceled) {
      return newRow;
    }

    if(!newRow.isSavedInDatabase) {
      const id1 = Math.round(takeUniqueId());
      const id2 = Math.round(takeUniqueId());
      const id3 = Math.round(takeUniqueId());
      setRows((oldRows) => {
        return oldRows 
          ? [
              ...oldRows!,
              ...[
                { ...newRow, ...{ id: id1, isSavedInDatabase: false, canceled: false, }, },
                { ...newRow, ...{ id: id2, isSavedInDatabase: false, canceled: false, }, },
                { ...newRow, ...{ id: id3, isSavedInDatabase: false, canceled: false, }, }
              ],
            ]
          : [
              { ...newRow, ...{ id: id1, isSavedInDatabase: false, canceled: false, }, },
              { ...newRow, ...{ id: id2, isSavedInDatabase: false, canceled: false, }, },
              { ...newRow, ...{ id: id3, isSavedInDatabase: false, canceled: false, }, }
            ];
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
    getActions: ({ id }) => {
      const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
      const row = rows?.find((row) => row.id === id);

      if ((isInEditMode && row!.savedInDatabase)
        || (isInEditMode && !row!.savedInDatabase && row!.isChild)) {
        return [
          <GridActionsCellItem
            icon={<SaveIcon />}
            label="Save"
            onClick={handleSaveClick(id)}
          />,
          <GridActionsCellItem
            icon={<CancelIcon />}
            label="Cancel"
            className="textPrimary"
            onClick={handleCancelClick(id)}
            color="inherit"
          />,
        ];
      }

      return [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          className="textPrimary"
          onClick={handleEditClick(id)}
          color="inherit"
        />,
        // <GridActionsCellItem
        //   icon={<DeleteIcon />}
        //   label="Delete"
        //   onClick={handleClickOpenOnDeleteDialog(id)}
        //   color="inherit"
        // />,
        // <GridActionsCellItem
        //   icon={<AddIcon />}
        //   label="Delete"
        //   onClick={handleClickAddChildren(id)}
        //   color="inherit"
        // />,
      ];
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
                onRowEditStart={handleRowEditStart}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                slots={{
                  toolbar: EditToolbar,
                }}
                slotProps={{
                  toolbar: { setRows, setRowModesModel },
                }}
              />
              {/* <Dialog
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
              </Dialog> */}
            </>
          )
        : null
      }
      
    </Box>
  );
}