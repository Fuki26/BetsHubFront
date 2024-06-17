import { GridColDef, GridSortCellParams, GridSortModel } from '@mui/x-data-grid';
import { BetModel } from '../../models';
import { GridApiCommunity } from '@mui/x-data-grid/internals';

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
    abbreviations: Array<string>, apiRef: React.MutableRefObject<GridApiCommunity>) => {
    const idx = columns.findIndex((c: any) => c.field === 'psLimit');
    const currencyColumns: Array<GridColDef> = abbreviations.map((a) => {
        const field = `amount${a}`;
        return ({
            field,
            headerName: a,
            type: 'text',
            editable: true,
            width: 100,
            align:'left',
            sortable: true,
            sortingOrder: [ 'asc', 'desc', ],
        })
    });
    columns.splice(idx + 1, 0, ...currencyColumns);
};