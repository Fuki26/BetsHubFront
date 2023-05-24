import { Paper, Typography} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import Bets from '../../components/Bets/Bets';
import { BetModel } from '../../models';


export default function Hub() {
  const selectedDateFn = (value: Date | null) => {
    const date = (value! as any).$d as Date;
    alert(`year: ${date.getFullYear()} month: ${date.getMonth()} date: ${date.getDate()}`);
  };

  const selectedBetFn = (selectedBet: BetModel) => {
    alert(JSON.stringify(selectedBet));
  };

  return (
    <Paper sx={{ padding: '5%', }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar onChange={selectedDateFn}/>
      </LocalizationProvider>
      <Typography variant="h4">PENDING</Typography>
      <Bets completed={false} selectedBetFn={selectedBetFn} />
      {/* <Typography variant="h4">COMPLETED</Typography>
      <Bets completed={true} selectedBetFn={selectedBetFn} /> */}
    </Paper>
  );
}
