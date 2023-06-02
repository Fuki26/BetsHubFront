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
import { CurrencyModel, EditToolbarProps, Enums, } from '../../models';
import { ItemTypes } from '../../models/enums';
import { getCurrencies, upsertCurrency, } from '../../api';
import { Currency, } from '../../database-models';

export default function Currencies() {

  const [ isLoading, setIsLoading, ] = React.useState<boolean>(false);

  const [ rows, setRows] = React.useState<Array<CurrencyModel> | undefined>(undefined);
  const [ rowModesModel, setRowModesModel, ] = React.useState<GridRowModesModel>({});
  const [ deleteRowId, setDeleteRowId, ] = React.useState<number | null>(null);
  const [ deleteDialogIsOpened, setOpenDeleteDialog, ] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const currenciessDatabaseModels: Array<Currency> | undefined 
          = await getCurrencies();
        let currencies: Array<CurrencyModel> = currenciessDatabaseModels
          ? currenciessDatabaseModels.map((c: Currency) => {
              return {
                  id: c.id,
                  name: c.name,
                  abbreviation: c.abbreviation,
                  conversionRateToBGN: c.conversionRateToBGN,
                  dateCreated: new Date(c.dateCreated),
                  dateChanged: new Date(c.dateChanged),

                  actionTypeApplied: undefined,
                  isSavedInDatabase: true,
                };
              })
          : [];

        setRows(currencies);

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
      setRows((oldRows) => [...oldRows, 
        { 
          id,
          name: '',
          abbreviation: '',
          conversionRateToBGN: 0,
          dateCreated: new Date(),
          dateChanged: new Date(),
      
          actionTypeApplied: undefined,
          isSavedInDatabase: false,
        } as CurrencyModel
      ]);

      setRowModesModel((oldModel) => ({
        ...oldModel,
        [id]: { mode: GridRowModes.Edit, },
      }));
    };
  
    return (
      <GridToolbarContainer>
        <Button color='primary' variant='contained' startIcon={<AddIcon />} onClick={handleAddNewClick}>
          Create a currency
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

    //await deleteCurrency({ id: deleteRowId, });
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
          const newRowData: CurrencyModel = {
            ...currentRow,
            name: newRow.name,
            abbreviation: newRow.abbreviation,
            conversionRateToBGN: newRow.conversionRateToBGN,
            dateCreated: newRow.dateCreated,
            dateChanged: newRow.dateChanged,
          };

          setIsLoading(true);
          
          await upsertCurrency({ ...newRowData, 
            id: currentRow.actionTypeApplied === Enums.ActionType.SAVED 
              ? null
              : currentRow.id
          });

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
      field: 'abbreviation',
      headerName: 'Abbreviation',
      type: 'string',
      editable: true,
      width: 150,
    },
    {
      field: 'conversionRateToBGN',
      headerName: 'Conversion Rate to BGN',
      type: 'number',
      editable: true,
      width: 150,
    },
    {
      field: 'dateCreated',
      headerName: 'Date created',
      type: 'date',
      editable: true,
      width: 150,
    },
    {
      field: 'dateChanged',
      headerName: 'Date changed',
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
      <Typography variant='h3'>Currencies</Typography>
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
                    {'Are you sure you want to delete the currency?'}
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