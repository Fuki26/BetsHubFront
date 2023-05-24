import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { ItemTypes } from '../Bets/Bets';

interface OptionType {
  id?: string;
  inputValue?: string;
  label: string;
}

const filter = createFilterOptions<OptionType>();

export default function FreeSoloCreateOptionDialog(props: {
  betId?: number;
  items: Array<{ id?: string; label: string; inputValue: '', }>,
  defaultValue: OptionType | null;
  itemType: ItemTypes;
  onChangeCb: (props: { betId?: number; itemType: ItemTypes; id?: string; label: string; }) => void;
  onAddNewValueCb: (props: { betId?: number; itemType: ItemTypes; inputValue: string; }) => void;
  onClick: (props: { betId: number; }) => void;
}) {
  const { betId, items, defaultValue, itemType, onChangeCb, onAddNewValueCb, 
    onClick, } = props;
  const [value, setValue] = React.useState<OptionType | null>(null);
  const [open, toggleOpen] = React.useState(false);

  const handleClose = () => {
    setDialogValue({
      label: '',
    });
    toggleOpen(false);
  };

  const [dialogValue, setDialogValue] = React.useState({
    label: '',
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValue({
      label: dialogValue.label,
    });
    handleClose();
    onAddNewValueCb({ betId, itemType, inputValue: dialogValue.label, });
  };
  
  return (
    <React.Fragment>
      <Autocomplete
        value={value}
        onChange={(event, newValue) => {
          if (typeof newValue === 'string') {
            setTimeout(() => {
              toggleOpen(true);
              setDialogValue({
                label: newValue,
              });
            });
          } else if (newValue && newValue.inputValue) {
            toggleOpen(true);
            setDialogValue({
              label: newValue.inputValue,
            });
          } else {
            setValue(newValue);
            onChangeCb({ betId, itemType, id: newValue!.id, label: newValue!.label });
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          if (params.inputValue !== '') {
            filtered.push({
              inputValue: params.inputValue,
              label: `Add "${params.inputValue}"`,
            });
          }

          return filtered;
        }}
        id="free-solo-dialog-demo"
        options={items}
        getOptionLabel={(option) => {
          if (typeof option === 'string') {
            return option;
          }
          if (option.inputValue) {
            return option.inputValue;
          }
          return option.label;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        renderOption={(props, option) => <li {...props}>{option.label}</li>}
        sx={{ width: 300 }}
        freeSolo
        renderInput={(params) => <TextField 
          onClick={() => { onClick({ betId: betId!, })} }
          {...params} 
          label={itemType} 
        />}
      />
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add a new {itemType}.</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Did you miss any {itemType} in our list? Please, add it!
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              value={dialogValue.label}
              onChange={(event) =>
                setDialogValue({
                  ...dialogValue,
                  label: event.target.value,
                })
              }
              label="title"
              type="text"
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
    </React.Fragment>
  );
}