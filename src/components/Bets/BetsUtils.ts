import { GridColDef } from '@mui/x-data-grid';
import { BetModel } from '../../models';

export const sortBets = (bets: Array<BetModel>): Array<BetModel> => {
    const notCompletedBets = bets.filter((b) => {
        return !b.liveStatus || !b.counterAgent || !b.sport 
        || !b.tournament || !b.market || !b.stake 
        || !b.psLimit || !b.totalAmount || !b.odd || !b.notes;
    });

    const completedBets = bets.filter((b) => {
        return b.liveStatus && b.counterAgent && b.sport && b.tournament
        && b.market && b.stake && b.psLimit && b.totalAmount && b.odd && b.notes;
    });

    const allBets = notCompletedBets.concat(completedBets);

    return allBets;
}

export const insertCurrenciesIntoColumns = (columns: Array<GridColDef>, 
    abbreviations: Array<string>) => {
    const idx = columns.findIndex((c: any) => c.field === 'psLimit');
    const currencyColumns: Array<GridColDef> = abbreviations.map((a) => ({
        field: `amount${a}`,
        headerName: a,
        type: 'text',
        editable: true,
        width: 100,
        align:'left'
    }));
    columns.splice(idx + 1, 0, ...currencyColumns);
};