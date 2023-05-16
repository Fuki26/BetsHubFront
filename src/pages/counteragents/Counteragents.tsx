import { useEffect, } from 'react';
import * as React from 'react';
import { DataGridPro, GridActionsCellItem, GridColDef,
  GridRowId, GridRowModel, GridRowModes, GridRowModesModel, 
  GridRowsProp, GridToolbarContainer } from "@mui/x-data-grid-pro";
import axios from "axios";
import { Button, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Close';
import { Counteragent } from '../../database-models';
import { CounteragentModel } from '../../models';
import { ActionType } from '../../models/enums';
import { toast } from 'react-toastify';


interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
  ) => void;
}

function EditToolbar(props: EditToolbarProps) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = Math.round(Math.random() * 1000000);
    setRows((oldRows) => [...oldRows, 
      { 
        id, 
        name: '',
        counteragentCategory: '',
        usedMinRate: 0,
        usedMaxRate: 0,
        maxRate: 0,
        dateCreated: new Date(),
        dataChanged: new Date(),
        user: '',

        actionTypeApplied: undefined,
        isSavedInDatabase: false,
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
        Add counteragent
      </Button>
    </GridToolbarContainer>
  );
}

export default function Counteragents() {
  const [rows, setRows] = React.useState<Array<CounteragentModel> | null>(null);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  useEffect(() => {
    (async function() {
      try {
        const getAllCounterAgentsResult = await axios.get("http://213.91.236.205:5000/GetAllCounteragents");
        const allCounteragents: Array<CounteragentModel> 
          = getAllCounterAgentsResult.data.map((counteragent: Counteragent) => {
          return {
            id: counteragent.id,
            name: counteragent.name,
            counteragentCategory: counteragent.counteragentCategory
              ? counteragent.counteragentCategory.name
              : '',
            dateCreated: new Date(counteragent.dateCreated),
            dateChanged: new Date(counteragent.dateChanged),
            maxRate: counteragent.maxRate,
            usedMaxRate: counteragent.usedMaxRate,
            usedMinRate: counteragent.usedMinRate,
            user: counteragent.user 
              ? counteragent.user.userName
              : '',
            isSavedInDatabase: true,
          } as CounteragentModel;
        });
        
        setRows(allCounteragents);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

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
    })
  };

  const handleCancelClick = (id: GridRowId) => () => {
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
    })
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
          return row;
        }
      });
    });
    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [id]: { mode: GridRowModes.Edit } }
    })
  };

  //#endregion Actions handlers

  //#region Rows update handler

  const processRowUpdate = (newRow: GridRowModel) => {
    const currentRow = rows?.find((row) => row.id === newRow.id);
    toast(currentRow?.actionTypeApplied === ActionType.CANCELED 
        ? 'Canceled' 
        : `Saved counteragent with id ${currentRow!.id}`,
      {
        position: 'top-center',
      });
    setRows((previousRowsModel) => {
      return previousRowsModel!.map((row) => {
        if(row.id === newRow.id) {
          return {
            ...row, 
            name: newRow.name,
            maxRate: newRow.maxRate,

            actionTypeApplied: undefined,
            isSavedInDatabase: true,
          };
        } else {
          return row;
        }
      });
    });
    setRowModesModel((previousRowModesModel) => {
      return { ...previousRowModesModel, [newRow.id]: { mode: GridRowModes.View } }
    });

    return newRow;
  };

  //#endregion Rows update handler
  
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
      headerName: 'Category of counteragent',
      type: 'string',
      editable: false,
      width: 150,
    },
    {
      field: 'usedMinRate',
      headerName: 'used Min rate',
      type: 'number',
      editable: false,
      width: 150,
    },
    {
      field: 'usedMaxRate',
      headerName: 'used Max rate',
      type: 'number',
      editable: false,
      width: 150,
    },
    {
      field: 'maxRate',
      headerName: 'MAX rate',
      type: 'number',
      editable: true,
      width: 150,
    },
    {
      field: 'dateCreated',
      headerName: 'date created',
      type: 'date',
      editable: false,
      width: 150,
    },
    {
      field: 'dateChanged',
      headerName: 'date changed',
      type: 'date',
      editable: false,
      width: 150,
    },
    {
      field: 'user',
      headerName: 'User(only for GA)',
      type: 'string',
      editable: false,
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
            ]
      },
    }
  ];

  return (
    <Paper sx={{ padding: '5%', }}>
      {
        rows
          ? ( 
              <DataGridPro
                columns={columns}
                rows={rows}   
                slots={{
                  toolbar: EditToolbar,
                }}
                rowModesModel={rowModesModel}
                processRowUpdate={processRowUpdate}
                slotProps={{
                  toolbar: { setRows, setRowModesModel },
                }}
              />
            )
          : null
      }
    </Paper>
  );
}
  