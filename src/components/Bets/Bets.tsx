import React, { useEffect, useState, useCallback, } from 'react';
import { toast, } from 'react-toastify';
import { isMobile, } from 'react-device-detect';
import { DataGrid, GridColDef, GridRowId, GridRowModel, GridRowModes,
  GridRowModesModel, GridRowParams, GridCellParams, GridToolbarContainer, GridEventListener, } from '@mui/x-data-grid';
import { Button, Dialog, DialogActions, DialogTitle,
  Paper, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { BetModel, EditToolbarProps, Enums,
  IDropdownValue, ISelectionsResult,} from '../../models';
import { deleteBet, upsertBet, getBetHistory, } from '../../api';
import { BetStatus, WinStatus, LiveStatus, } from '../../models/enums';
import { Currency, } from '../../database-models';
import Modal from '../UI/Modal';
import { getBetsColumns, } from './BetsColumns';
import CustomToolbar from '../CustomToolbar/CustomToolbar';
import './Bets.css';
const { evaluate } = require('mathjs');

const getAbbreviations = (currencies: Currency[] | undefined) => {
  if (!currencies) return [];
  return currencies.map((cur) => cur.abbreviation);
};

const insertCurrenciesIntoColumns = (columns: any, abbreviations: string[]) => {
  const idx = columns.findIndex((c: any) => c.field === "psLimit");
  const currencyColumns = abbreviations.map((a) => ({
    field: `amount${a}`,
    headerName: a,
    type: "text",
    editable: true,
    width: 100,
    align:"left"
  }));
  columns.splice(idx + 1, 0, ...currencyColumns);
};

function Bets(props: {
  id: string;
  isRead: boolean;
  arePengindBets: boolean;
  editBetTotalAmountsNotify?: (betId: number, totalAmount: number, ) => void;
  savedBet: (bets: Array<BetModel>, bet: BetModel) => void;
  selectBetIdFn: (id: number) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;

  defaultRows: Array<BetModel> | undefined;
  currencies: Array<Currency> | undefined;

  possibleCounteragents: Array<IDropdownValue> | undefined;
  possibleSports: Array<IDropdownValue> | undefined;
  possibleTournaments: Array<IDropdownValue> | undefined;
  possibleSelections: Array<{ id: number; selections: Array<IDropdownValue> | undefined, }>;
  possibleMarkets: Array<IDropdownValue> | undefined;
}) {
  const {
    isRead, arePengindBets, selectBetIdFn, setIsLoading,
    defaultRows, currencies, possibleCounteragents, possibleSports,
    possibleTournaments, possibleSelections, possibleMarkets, } = props;

  const handleCellKeyDown: GridEventListener<"cellKeyDown"> 
    = (params, event) => {
      if (event.key === 'Tab' && params.cellMode === 'edit') {
        event.preventDefault(); // Prevent the default Tab behavior

        // [1-...]
        let columnIndex = document.activeElement!.getAttribute('aria-colindex')
          ? Number.parseInt(document.activeElement!.getAttribute('aria-colindex')!)
          : document.activeElement!.parentElement?.getAttribute('aria-colindex')
            ? Number.parseInt(document.activeElement!.parentElement?.getAttribute('aria-colindex')!)
            : document.activeElement!.parentElement!.parentElement!.getAttribute('aria-colindex')
              ? Number.parseInt(document.activeElement!.parentElement!.parentElement!.getAttribute('aria-colindex')!)
              : document.activeElement!.parentElement!.parentElement!.parentElement!.getAttribute('aria-colindex')
                ? Number.parseInt(document.activeElement!.parentElement!.parentElement!.parentElement!.getAttribute('aria-colindex')!)
                : document.activeElement!.parentElement!.parentElement!.parentElement!.parentElement!.getAttribute('aria-colindex')
                  ? Number.parseInt(document.activeElement!.parentElement!.parentElement!.parentElement!.parentElement!.getAttribute('aria-colindex')!)
                  : -1;

        let focusColumnsIds = [
          { currentColumnId: 1, focusColumnId: 2, },
          { currentColumnId: 2, focusColumnId: 3, },
          { currentColumnId: 3, focusColumnId: 4, },
          { currentColumnId: 4, focusColumnId: 5, },
          { currentColumnId: 5, focusColumnId: 6, },
        ];

        let currentPointer = 6;
        if(currencies && currencies.length > 0) {
          for(var i = 0; i <= currencies?.length - 1; i++) {
            focusColumnsIds.push({ currentColumnId: currentPointer, focusColumnId: currentPointer + 1, },);
            currentPointer++;
          }
        }

        focusColumnsIds = focusColumnsIds.concat([
          { currentColumnId: currentPointer, focusColumnId: currentPointer + 1, },
          { currentColumnId: currentPointer + 1, focusColumnId: currentPointer + 2, },
          { currentColumnId: currentPointer + 2, focusColumnId: currentPointer + 3, },
          { currentColumnId: currentPointer + 3, focusColumnId: currentPointer + 5, },
          { currentColumnId: currentPointer + 4, focusColumnId: currentPointer + 5, },
          { currentColumnId: currentPointer + 5, focusColumnId: currentPointer + 9, },
          { currentColumnId: currentPointer + 6, focusColumnId: currentPointer + 9, },
          { currentColumnId: currentPointer + 7, focusColumnId: currentPointer + 9, },
          { currentColumnId: currentPointer + 8, focusColumnId: currentPointer + 9, },
          { currentColumnId: currentPointer + 9, focusColumnId: 2, },
        ]);
        
        let elementToBeFocused = null;
        while(!elementToBeFocused) {
          let columnIndexToBeFocused = focusColumnsIds.find((c) => {
            return c.currentColumnId === columnIndex;
          });

          elementToBeFocused = document.querySelector(`[aria-colindex="${columnIndexToBeFocused!.focusColumnId}"] input`);
          if(elementToBeFocused) {
            (elementToBeFocused! as any).focus();
          } else {
            columnIndex++;
            if(columnIndex > 20) {
              columnIndex = 1;
            }
          }
        }
      }
  };

  const sortBets = (bets: Array<BetModel>): Array<BetModel> => {
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

  const [rows, setRows] = useState<Array<BetModel>>(
    defaultRows ? sortBets(defaultRows) : []
  );
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [deleteRowId, setDeleteRowId] = useState<number | undefined>(undefined);
  const [deleteDialogIsOpened, setOpenDeleteDialog] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState(null);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({});
  const [betsSelections, setBetsSelections] = 
    useState<Array<{ id: number; selections: Array<IDropdownValue> | undefined, }>>(possibleSelections);


  const abbreviations = getAbbreviations(currencies);

  useEffect(() => {
    setRows((oldRows) => {
      return defaultRows ? sortBets(defaultRows) : [];
    });
  
    setRowModesModel(() => {
      return {};
    });
  }, [defaultRows]);


  useEffect(() => {
    const savedColumnVisibilityModel = 
      JSON.parse(localStorage.getItem(`${props.id}ColumnVisibilityModel`) || '{}');
    if (savedColumnVisibilityModel) {
      setColumnVisibilityModel(savedColumnVisibilityModel);
    }
  }, []);

  const handleColumnVisibilityChange = useCallback((params: any) => {
    const newVisibilityModel = {...columnVisibilityModel, ...params};
    localStorage.setItem(`${props.id}ColumnVisibilityModel`, JSON.stringify(newVisibilityModel));
    setColumnVisibilityModel(newVisibilityModel);
  }, []);

  function EditToolbar(props: EditToolbarProps) {
    const { setRows, setRowModesModel } = props;

    const handleAddNewClick = () => {
      const id = Math.round(Math.random() * 1000000);
      setRows((oldRows) => [
        {
          id,
          dateCreated: new Date(),
          betStatus: {
            id: BetStatus.Pending.toString(),
            label: BetStatus[BetStatus.Pending],
          },
          winStatus: {
            id: WinStatus.None.toString(),
            label: WinStatus[WinStatus.None],
          },
          stake: undefined,
          counterAgent: undefined,
          sport: undefined,
          liveStatus: {
            id: LiveStatus.PreLive.toString(),
            label: LiveStatus[LiveStatus.PreLive],
          },
          psLimit: undefined,
          market: undefined,
          tournament: undefined,
          selection: undefined,
          amounts: undefined,
          totalAmount: undefined,
          odd: undefined,
          dateFinished: undefined,
          profits: undefined,
          notes: undefined,

          actionTypeApplied: undefined,
          isSavedInDatabase: false,
        } as BetModel,
        ...oldRows,
      ]);

      setRowModesModel((oldModel) => ({
        ...oldModel,
        [id]: { mode: GridRowModes.Edit, className: `super-app-theme--edit` },
      }));
    };

    const isAnyRowInEditMode = rows.some((r: BetModel) => {
      const rowModeData = rowModesModel[r.id];
      return rowModeData && rowModeData.mode === GridRowModes.Edit;
    });

    return !isMobile ? (
      <GridToolbarContainer>
        <Button
          color="primary"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNewClick}
          disabled={isAnyRowInEditMode}
        >
          Create a bet
        </Button>
      </GridToolbarContainer>
    ) : (
      <></>
    );
  }

  //#region Delete dialog

  const handleClickOpenOnDeleteDialog = (id: GridRowId) => () => {
    setDeleteRowId(parseInt(id.toString(), 10));
    setOpenDeleteDialog(true);
  };

  const handleCloseOnDeleteDialog = () => {
    setDeleteRowId(undefined);
    setOpenDeleteDialog(false);
  };

  //#endregion

  //#region Actions handlers

  const handleSaveClick = (id: GridRowId) => () => {
    setRows((previousRowsModel) => {
      return previousRowsModel.map((row: BetModel) => {
        if (row.id === id) {
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
      return { ...previousRowModesModel, [id]: { mode: GridRowModes.View } };
    });
  };

  const getRowClassName = (params : any) => {
    const row = rows.find((r) => r.id === params.id);
    if (!props.arePengindBets && row && row.winStatus?.label) {
      switch (row.winStatus.label) {
        // case WinStatus[0]:
        //   return "row-win-status-void";
        case WinStatus[1]:
          return "row-win-status-winner";
        case WinStatus[2]:
          return "row-win-status-loser";
        case WinStatus[3]:
          return "row-win-status-halfwin";
        case WinStatus[4]:
          return "row-win-status-halfloss";
        case WinStatus[5]:
          return "row-win-status-void";
        default:
          return "";
      }
    }

    return "";
  };



  const handleCancelClick = (id: GridRowId) => () => {
    const canceledRow = rows.find((r) => r.id === id);
    if (!canceledRow) {
      return;
    }

    if (!canceledRow.isSavedInDatabase) {
      setRows((previousRowsModel) => {
        return previousRowsModel.filter((row) => {
          return row.id !== id;
        });
      });
    } else {
      setRows((previousRowsModel) => {
        return previousRowsModel.map((row) => {
          if (row.id === id) {
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
        return { ...previousRowModesModel, [id]: { mode: GridRowModes.View } };
      });
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRows((previousRowsModel) => {
      return previousRowsModel.map((row) => {
        if (row.id === id) {
          return {
            ...row,
            actionTypeApplied: Enums.ActionType.EDITED,
          };
        } else {
          return {
            ...row,
            actionTypeApplied: undefined,
          };
        }
      });
    });

    setRowModesModel((previousRowModesModel) => {
      let newRowsModel: GridRowModesModel = {};
      // newRowsModel[id] = { mode: GridRowModes.Edit };
      for (var i = 0; i <= rows.length - 1; i++) {
        const currentRow = rows[i];
        if (currentRow.id === id) {
          newRowsModel[currentRow.id] = { mode: GridRowModes.Edit };
        } else {
          newRowsModel[currentRow.id] = { mode: GridRowModes.View };
        }
      }

      return newRowsModel;
    });
  };

  const handleHistoryClick = async (params: GridRowParams) => {
    const row = rows!.find((row) => row.id === params.id);

    if (!row) {
      return;
    }
    // const betId = await selectBetIdFn(row.id);
    const history = await getBetHistory(row.id);

    setShowHistoryModal(true);
    setHistory(history);
  };

  const handleDeleteClick = async () => {
    if (!deleteRowId) {
      return;
    }

    setIsLoading(true);

    await deleteBet({ id: deleteRowId });
    setDeleteRowId(undefined);
    setOpenDeleteDialog(false);

    setRows((previousRows) =>
      previousRows.filter((row) => row.id !== deleteRowId)
    );
    setRowModesModel((previousRowModesModel) => {
      delete previousRowModesModel[deleteRowId];
      return previousRowModesModel;
    });

    setIsLoading(false);
  };

  const handleCopyBetClick = (id: GridRowId) => () => {
    const clickedRow = rows.find((row) => row.id === id);
    if (!clickedRow) {
      return;
    }

    const randomId: number = Math.round(Math.random() * 1000000);
    setRows((oldRows) => {
      return [
        {
          id: randomId,
          dateCreated: clickedRow.dateCreated,
          betStatus: clickedRow.betStatus,
          winStatus: clickedRow.winStatus,
          stake: clickedRow.stake,
          counterAgent: clickedRow.counterAgent,
          sport: clickedRow.sport,
          liveStatus: clickedRow.liveStatus,
          psLimit: clickedRow.psLimit,
          market: clickedRow.market,
          tournament: clickedRow.tournament,
          selection: clickedRow.selection,
          amounts: clickedRow.amounts,
          totalAmount: undefined,
          odd: clickedRow.odd,
          dateFinished: undefined,
          profits: Number(clickedRow.profits?.toFixed(2)),
          notes: clickedRow.notes,
          actionTypeApplied: undefined,
          isSavedInDatabase: false,
        } as BetModel,
        ...oldRows,
      ];
    });
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [randomId]: { mode: GridRowModes.Edit },
    }));
  };

  const onRowClick = (params: GridRowParams) => {
    const row = rows.find((row) => row.id === params.id);
    if (row) {
      selectBetIdFn(row.id);
    }
  };

  const onCellEditStop = (params: GridCellParams) => {
    const row = rows.find((row) => row.id === params.id);
    if (row) {
      handleEditClick(row.id)();
    }
  };

  const processRowUpdate = async ( 
    newRow: GridRowModel<BetModel>
  ): Promise<BetModel> => {
    
    const currentRow = rows.find((row) => row.id === newRow.id);
    if (!currentRow) {
      return newRow;
    }

    let atLeastOneCurrencyIsPopulated = false;
    if (
      currentRow.actionTypeApplied === Enums.ActionType.SAVED ||
      currentRow.actionTypeApplied === Enums.ActionType.EDITED 
    ) {
      
      let amounts = Object.fromEntries(Object.entries(newRow).filter(([key, value]) => key.startsWith('amount')));
      for (let key in amounts) {
        if(amounts[key] as number > 0) {
          atLeastOneCurrencyIsPopulated = true;
        }

        if (
          typeof amounts[key] === "string")
           {
          amounts[key] = evaluate(amounts[key]);
        }
      }

      const newRowData: BetModel = {
        ...currentRow,
        dateCreated: newRow.dateCreated,
        betStatus: currentRow.betStatus,
        winStatus: currentRow.winStatus,
        liveStatus: currentRow.liveStatus,
        counterAgent: currentRow.counterAgent,
        sport: currentRow.sport,
        tournament: currentRow.tournament,
        selection: currentRow.selection,
        market: currentRow.market,

        stake: newRow.stake,
        psLimit: newRow.psLimit,
        ...amounts,
        totalAmount: newRow.totalAmount 
          ? Number(newRow.totalAmount.toFixed(2))
          : 0,
        odd: newRow.odd,
        dateFinished: new Date(),
        profits: newRow.profits 
          ? newRow.profits
          : 0,
        notes: newRow.notes,
      };
      setIsLoading(true);
      newRow = newRowData;
      if(arePengindBets 
            && 
            (
              !newRowData.liveStatus || !newRowData.counterAgent || !newRowData.sport
                || !newRowData.tournament || !newRowData.market || !newRowData.psLimit
                || !atLeastOneCurrencyIsPopulated && !newRowData.odd
            ) 
            && 
          (currentRow.winStatus && currentRow.winStatus.id !== '0')
        ) {
          setIsLoading(false);

          toast(
            `You should populate all required fields if you changed the win status.`,
            {
              position: "top-center",
            }
          );

          setRows((previousRowsModel) => {
            return previousRowsModel.map((row) => {
              if (row.id === newRow.id) {
                return {
                  ...newRowData,
                  winStatus: {
                    id: WinStatus.None.toString(),
                    label: 'None',
                  }
                };
              } else {
                return row;
    
              }
            });
          });

        return newRowData;
      } 

      const rowData = await upsertBet(newRowData);
      if (!rowData || !rowData.data) {
        toast(
          `Some fields are not populated correctly or they are missing.`,
          {
            position: "top-center",
          }
        );

        setRowModesModel((previousRowModesModel) => {
          return {
            ...previousRowModesModel,
            [newRowData.id]: { mode: GridRowModes.View },
          };
        });

        setRows((previousRowsModel) => {
          return previousRowsModel.filter((row) => {
            return row.id !== newRowData.id;
          });
        });

        setIsLoading(false);

        return newRow;
      }

      if(currentRow.selection) {
        let possibleSelectionsForBet: {
          id: number;
          selections: Array<IDropdownValue> | undefined;
        } | undefined = betsSelections.find((r) => {
          return r.id === rowData.data.id;
        });
  
        if(possibleSelectionsForBet) {
          const selection = possibleSelectionsForBet.selections?.find((s) => {
            return s.id === currentRow.selection?.id;
          });

          if(!selection) {
            setBetsSelections((p) => {
              const betSelections = p.find((betSelections) => betSelections.id === rowData.data.id);
              betSelections!.selections!
                .push({ id: currentRow.selection!.id, label: currentRow.selection!.label, },);
  
              return p;
            });
          }
        } else {
          setBetsSelections((p) => {
            p.push({
              id: rowData.data.id,
              selections: [
                { id: currentRow.selection!.id, label: currentRow.selection!.label, }
              ],
            });

            return p;
          });
        }
      }
      

      setRows((previousRowsModel) => {
        return previousRowsModel.map((row) => {
          if (row.id === newRow.id) {
            return {
              ...newRowData,
              id: rowData.data.id,
              totalAmount: rowData.data.totalAmount,
              profits: rowData.data.profits,

              actionTypeApplied: undefined,
              isSavedInDatabase: true,
            };
          } else {
            return row;

          }
        });
      });

      setRowModesModel((previousRowModesModel) => {
        return {
          ...previousRowModesModel,
          [rowData.data.id]: { mode: GridRowModes.View },
        };
      });
      setIsLoading(false);

      newRow.id = rowData?.data.id;
      newRow.totalAmount = rowData?.data.totalAmount;
      newRow.profits = rowData?.data.profits;
      if(props.editBetTotalAmountsNotify) {
        props.editBetTotalAmountsNotify(newRow.id, newRow.totalAmount ? newRow.totalAmount : 0);
      }
    } else {
      
      setRowModesModel((previousRowModesModel) => {
        return {
          ...previousRowModesModel,
          [newRow.id]: { mode: GridRowModes.View },
        };
      });
    }

    toast(
      currentRow.actionTypeApplied === Enums.ActionType.CANCELED
        ? "Canceled"
        : `Saved bet with id ${newRow!.id}`,
      {
        position: "top-center",
      }
    );

    if(!currentRow.actionTypeApplied) {
      currentRow.actionTypeApplied = newRow.actionTypeApplied;
      return currentRow;
    } else{
      if(arePengindBets && (newRow.liveStatus && newRow.counterAgent && newRow.sport
            && newRow.tournament && newRow.market && newRow.psLimit
            && atLeastOneCurrencyIsPopulated && newRow.odd) && 
          (newRow.winStatus && newRow.winStatus.id !== '0')) {
        setTimeout(() => {
          props.savedBet(rows, newRow);
          setRows((previousRowsModel) => {
            return previousRowsModel.filter((row) => {
              if(row.id !== newRow!.id) {
                return row;
              }
            });
          });
        }, 500);
      }

      return { 
        ...newRow,
        profits: currentRow.profits,
      };
    }
  };

  let columns: Array<GridColDef> = getBetsColumns({ 
    rows, 
    setRows,
    possibleCounteragents,
    possibleSports,
    possibleTournaments,
    possibleSelections: betsSelections,
    possibleMarkets,
    currencies,
    rowModesModel,
    isRead,
    isMobile,
    handleSaveClick,
    handleCancelClick,
    handleEditClick,
    handleHistoryClick,
    handleCopyBetClick,
    handleClickOpenOnDeleteDialog,
  });

  const handleModalClose = () => setShowHistoryModal(false);
  if (showHistoryModal && history) {
    return (
      <Modal
        open={showHistoryModal}
        handleClose={handleModalClose}
        betsHistory={history}
      />
    );
  }

  if (props.arePengindBets) {
    columns = columns.filter((c) => c.headerName !== "Profits");
  }

  insertCurrenciesIntoColumns(columns, abbreviations);

  return (
    <Paper sx={{ paddingTop: "1%" }}>
      {rows ? (
        <>
          <DataGrid
            onCellKeyDown={handleCellKeyDown}
            columns={columns}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  ...JSON.parse(localStorage.getItem(`${props.id}ColumnVisibilityModel`) || '{}')
                },
              },
            }}
            onColumnVisibilityModelChange={handleColumnVisibilityChange}
            getRowClassName={getRowClassName}
            columnBuffer={2}
            columnThreshold={2}
            rows={rows}
            slots={{
              toolbar: isRead ? CustomToolbar : EditToolbar,
            }}
            rowModesModel={rowModesModel}
            processRowUpdate={processRowUpdate}
            slotProps={{
              toolbar: { setRows, setRowModesModel, rows, currencies,  printOptions: { disableToolbarButton: true }},
            }}
            onRowClick={onRowClick}
            onCellEditStop={onCellEditStop}
            // editMode="row"
            editMode="cell"
            sx={{
              height: 500,
            }}
          />
          <Dialog
            open={deleteDialogIsOpened}
            onClose={handleCloseOnDeleteDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Are you sure you want to delete the bet?"}
            </DialogTitle>
            <DialogActions>
              <Button onClick={handleDeleteClick} autoFocus>
                Yes
              </Button>
              <Button onClick={handleCloseOnDeleteDialog}>No</Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
    </Paper>
  );
}

export default React.memo(Bets);
