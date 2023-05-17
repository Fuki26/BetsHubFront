import { Paper, Typography} from '@mui/material';
import Bets from '../../components/Bets/Bets';


export default function Hub() {
  return (
    <Paper sx={{ padding: '5%', }}>
      <Typography variant="h4">PENDING</Typography>
      <Bets completed={false} />
      <Typography variant="h4">COMPLETED</Typography>
      <Bets completed={true} />
    </Paper>
  );
}
