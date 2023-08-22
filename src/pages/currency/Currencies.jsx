import { useState, useCallback, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Dialog from '@mui/material/Dialog';
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { getCurrencies, upsertCurrency, deleteCurrency } from "../../api";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';

export default function CurrencyTable() {
  const [rows, setRows] = useState([]);

  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState();
  const [openAdd, setOpenAdd] = useState(false);
  const [newRow, setNewRow] = useState({
    name: "",
    abbreviation: "",
    conversionRateToBGN: "",
    dateCreated: null,
    dateChanged: null,
  });

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Name", width: 80 },
    { field: "abbreviation", headerName: "Abbreviation", width: 80 },
    {
      field: "conversionRateToBGN",
      headerName: "Conversion Rate to BGN",
      type: "number",
      width: 180,
    },
    { field: "dateCreated", headerName: "Date Created", width: 230 },
    { field: "dateChanged", headerName: "Date Changed", width: 230 },
    {
      field: "Modify",
      headerName: "Modify",
      sortable: false,
      width: 120,
      disableClickEventBubbling: true,
      renderCell: (params) => {
        const onClick = async () => {
          await deleteCurrency({ id: params.id });
          fetchCurrencies();
        };
        return (
          <>
            <IconButton
              onClick={(e) => {
                handleRowEditButton(params.row);
              }}
              aria-label="delete"
              size="large"
            >
              <EditIcon />
            </IconButton>
            <IconButton onClick={onClick} aria-label="delete" size="large">
              <DeleteIcon />
            </IconButton>
          </>
        );
      },
    },
  ];

  const fetchCurrencies = useCallback(async () => {
    try {
      const currenciessDatabaseModels = await getCurrencies();
      let currencies = currenciessDatabaseModels.map((c) => ({
        id: c.id,
        name: c.name,
        abbreviation: c.abbreviation,
        conversionRateToBGN: c.conversionRateToBGN.toFixed(2),
        dateCreated: new Date(c.dateCreated),
        dateChanged: new Date(c.dateChanged),
        actionTypeApplied: undefined,
        isSavedInDatabase: true,
      }));
      setRows(currencies);
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const handleRowEditButton = (row) => {
    setEditRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditRow(null);
  };

  const handleSave = async () => {
    await upsertCurrency({ ...editRow });
    fetchCurrencies();
    handleClose();
  };

  const handleAddClick = () => {
    setOpenAdd(true);
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
    setNewRow({
      name: "",
      abbreviation: "",
      conversionRateToBGN: "",
      dateCreated: null,
      dateChanged: null,
    });
  };

  const handleSaveAdd = async () => {
    await upsertCurrency({ ...newRow });
    fetchCurrencies();
    handleCloseAdd();
  };

  return (
    <div
      style={{
        paddingTop: "100px",
        paddingLeft: "2%",
        minHeight: "500px",
        width: "100%",
      }}
    >
      <Button variant="contained" color="primary" onClick={handleAddClick}>
        Add Currency
      </Button>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={15}
      />

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Currency</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={editRow?.name || ""}
            onChange={(e) => setEditRow({ ...editRow, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Abbreviation"
            type="text"
            fullWidth
            value={editRow?.abbreviation || ""}
            onChange={(e) =>
              setEditRow({ ...editRow, abbreviation: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Conversion Rate to BGN"
            type="number"
            fullWidth
            value={editRow?.conversionRateToBGN || ""}
            onChange={(e) =>
              setEditRow({ ...editRow, conversionRateToBGN: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openAdd} onClose={handleCloseAdd}>
        <DialogTitle>Add Currency</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={newRow?.name || ""}
            onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Abbreviation"
            type="text"
            fullWidth
            value={newRow?.abbreviation || ""}
            onChange={(e) =>
              setNewRow({ ...newRow, abbreviation: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Conversion Rate to BGN"
            type="number"
            fullWidth
            value={newRow?.conversionRateToBGN || ""}
            onChange={(e) =>
              setNewRow({ ...newRow, conversionRateToBGN: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveAdd} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
