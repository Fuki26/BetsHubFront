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
            sortComparator: (
                value1: string, 
                value2: string, 
                cellParam1: GridSortCellParams,
                cellParam2: GridSortCellParams, 
            ) => {
                const sortingModel: GridSortModel = apiRef.current.getSortModel();
                const columnSortingModel = sortingModel.find((model) => {
                    return model.field === field;
                });
    
                if(parseInt(cellParam1.id.toString()) > 10000 
                    || parseInt(cellParam2.id.toString()) > 10000) {
                    if(columnSortingModel!.sort === 'asc') {
                        return 1;
                    } else {
                        return -1;
                    }
                }
    
                if(value1 && !value2) {
                    return 1;
                } else if(!value1 && value2) {
                    return -1;
                } else if(!value1 && !value2) {
                    return 0;
                }
    
                if (parseInt(value1) < parseInt(value2)) {
                    return -1;
                } else if (parseInt(value1) > parseInt(value2)) {
                    return 1;
                } else {
                    return 0;
                }
            },
        })
    });
    columns.splice(idx + 1, 0, ...currencyColumns);
};