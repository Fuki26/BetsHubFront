import { useEffect, } from 'react';
import * as React from 'react';
import { DataGridPro, GridActionsCellItem, GridColDef, GridRowId, 
  GridRowModel, GridRowModes, GridRowModesModel, GridRowsProp, GridToolbarContainer, } 
from '@mui/x-data-grid-pro';
import axios from 'axios';
import { Button, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Close';
import { User } from '../../database-models';
import { UserModel, Enums, } from '../../models';
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
        userName: '',
        password: '',
        role: 0,
        address: '',
        device: '',

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
      <Button color='primary' variant='contained' startIcon={<AddIcon />} onClick={handleClick}>
        Add user
      </Button>
    </GridToolbarContainer>
  );
}

export default function Users() {
  const [rows, setRows] = React.useState<Array<UserModel> | null>(null);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  useEffect(() => {
    (async function() {
      try {
        const getAllUsersResult = await axios.get('http://213.91.236.205:5000/GetAllUsers');
        const allUsers: Array<UserModel> 
          = getAllUsersResult.data.map((user: User) => {
          return {
            id: user.id,
            userName: user.userName,
            password: user.password,
            role: user.roleId,
            address: user.address,
            device: user.address,
            isSavedInDatabase: true,
          } as UserModel;
        });
        
        setRows(allUsers);
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
    })
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

  //#endregion Actions handlers

  //#region Rows update handler

  const processRowUpdate = (newRow: GridRowModel) => {
    const currentRow = rows?.find((row) => row.id === newRow.id);
    toast(currentRow?.actionTypeApplied === Enums.ActionType.CANCELED 
        ? 'Canceled' 
        : `Saved user with id ${currentRow!.id}`, 
      {
        position: 'top-center',
      });
    setRows((previousRowsModel) => {
      return previousRowsModel!.map((row) => {
        if(row.id === newRow.id) {
          return {
            ...row, 
            userName: newRow.userName,
            password: newRow.password,
            role: newRow.role,

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
      field: 'userName',
      headerName: 'Username',
      type: 'string',
      editable: true,
      width: 150,
    },
    {
      field: 'password',
      headerName: 'Password',
      type: 'string',
      editable: true,
      width: 150,
      renderCell: () => {return null;}
    },
    {
      field: 'role',
      headerName: 'Role',
      type: 'number',
      editable: true,
      width: 150,
      renderCell: () => {return null;}
    },
    {
      field: 'address',
      headerName: 'IP',
      type: 'string',
      editable: false,
      width: 150,
    },
    {
      field: 'device',
      headerName: 'Device',
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
  