import { useState, } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const BetsTable = ({ rows, columns, addNewBet, editBet }) => {
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState();

  const handleRowEditButton = async (row) => {
    setEditRow(row);
    setOpen(true);
  };

  const handleSave = async () => {
    await editBet(editRow);
    setOpen(false);
  };

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid 
        rows={rows} 
        columns={columns} 
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        disableSelectionOnClick
      />
      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Update Bet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Bet Name"
            type="text"
            fullWidth
            value={editRow ? editRow.name : ''}
            onChange={(event) => setEditRow({ ...editRow, name: event.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BetsTable;
