import React, { useEffect, useState, useCallback, } from 'react';
import { toast, } from 'react-toastify';
import { isMobile, } from 'react-device-detect';
import { DataGrid, GridColDef, GridRowId, GridRowModel, GridRowModes,
  GridRowModesModel, GridRowParams, GridCellParams, GridToolbarContainer, 
  GridEventListener,useGridApiRef, } from '@mui/x-data-grid';
import { Button, Dialog, DialogActions, DialogTitle, Paper, 
  } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { BetModel, EditToolbarProps, BetStatus, 
  WinStatus, IDropdownValue, ActionType, BetsHistoryItemModel,} from '../../models';
import { deleteBet, upsertBet, getBetHistory, } from '../../api';
import { Currency, } from '../../database-models';
import Modal from '../UI/Modal';
import { getBetsColumns, } from './BetsColumns';
import CustomToolbar from '../CustomToolbar/CustomToolbar';
import './Bets.css';
import { insertCurrenciesIntoColumns, sortBets, } from '.';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
const { evaluate } = require('mathjs');

function Bets(props: {
  id: 'pending' | 'completed' | 'search';
  arePengindBets: boolean;
  onTotalOfTotalAmountsChanged?: (totalOfTotals: number) => void;
  onTotalProfitsChanged?: (totalOfProfits: number) => void;
  onWinRateChanged?: (winRate: number) => void;
  onNewSportAdded?: (sport: string) => void;
  onNewMarketAdded?: (market: string) => void;
  onNewTournamentAdded?: (tournament: string) => void;
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
    arePengindBets, onTotalOfTotalAmountsChanged, onTotalProfitsChanged, onWinRateChanged,
    onNewSportAdded, onNewMarketAdded, onNewTournamentAdded, selectBetIdFn, setIsLoading,
    defaultRows, currencies, possibleCounteragents, possibleSports,
    possibleTournaments, possibleSelections, possibleMarkets, } = props;

  const apiRef: React.MutableRefObject<GridApiCommunity> = useGridApiRef();

  const tabKeyHandler: GridEventListener<'cellKeyDown'> 
    = (params, event) => {
      if(event.key === 'Enter' && params.cellMode === 'edit') {
        const activeElement = document.activeElement;
        if(activeElement) {
          (activeElement as any).blur();
        }

        const saveButton = document.querySelectorAll('[aria-label="Save"]')[0];
        (saveButton as any).click();
      } else if (event.key === 'Tab' && params.cellMode === 'edit') {
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
          { currentColumnId: currentPointer + 3, focusColumnId: currentPointer + 4, },
          { currentColumnId: currentPointer + 4, focusColumnId: currentPointer + 5, },
          { currentColumnId: currentPointer + 5, focusColumnId: currentPointer + 6, },
          { currentColumnId: currentPointer + 6, focusColumnId: 2, },
        ]);
        
        let elementToBeFocused: any = null;
        while(!elementToBeFocused) {
          let columnIndexToBeFocused = focusColumnsIds.find((c) => {
            return c.currentColumnId === columnIndex;
          });
          elementToBeFocused = document.querySelector(`[aria-colindex='${columnIndexToBeFocused!.focusColumnId}'] input`);
          if(elementToBeFocused) {
            setTimeout(() => {
              (elementToBeFocused! as any).focus();
            }, 1);
            break;
          } else {
            columnIndex++;
            if(columnIndex > 20) {
              columnIndex = 1;
            }
          }
        }
      }
  };

  const detectZoom = () => {
    var ratio = 0;

    if (window.devicePixelRatio !== undefined) {
        ratio = window.devicePixelRatio;
    } else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
        ratio = window.outerWidth / window.innerWidth;
    }

    if (ratio) {
        return Math.round(ratio * 100);
    } else {
        return 100; // default value
    }
  }

  const updateElementSize = () => {
    var zoomLevel = detectZoom();
    var elements: HTMLCollectionOf<Element> = document.getElementsByClassName('MuiDataGrid-root');
    if(elements && elements[0]) {
      (elements[1] as any).style.height = 5400 * (100/zoomLevel) + 'px';
    }
  };

  window.addEventListener('resize', updateElementSize);

  const [rows, setRows] = useState<Array<BetModel>>(
    defaultRows ? sortBets(defaultRows) : []
  );
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const [deleteRowId, setDeleteRowId] = useState<number | undefined>(undefined);
  const [deleteDialogIsOpened, setOpenDeleteDialog] = useState(false);

  const [color, setColor] = useState<string>('FFF');
  const [colorRowId, setColorRowId] = useState<number | undefined>(undefined);
  const [colorDialogIsOpened, setOpenColorDialog] = useState<boolean>(false);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState<{
    betId: number;
    insertStatement: string;
    history: Array<BetsHistoryItemModel>;
  } | null>(null);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({});

  const [betsSelections, setBetsSelections] = 
    useState<Array<{ id: number; selections: Array<IDropdownValue> | undefined, }>>(possibleSelections);

  const abbreviations = currencies
    ? currencies.map((cur) => cur.abbreviation)
    : [];

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

  const editToolbarHandler = (props: EditToolbarProps) => {
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
          liveStatus: undefined,
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
          color='primary'
          variant='contained'
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

  //#region Color picker

  const handleClickOpenOnColorDialog = (id: GridRowId) => () => {
    setColor('FFF');
    setColorRowId(parseInt(id.toString(), 10));
    setOpenColorDialog(true);
  };

  const handleCloseOnColorDialog = () => {
    setColor('FFF');
    setColorRowId(undefined);
    setOpenColorDialog(false);
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
              ? ActionType.EDITED
              : ActionType.SAVED,
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
    if(!row) {
      return '';
    }

    if(props.arePengindBets && row.color) {
      switch (row.color) {
        case 'b9d7a6':
          return 'row-win-status-winner';
        case 'd86564':
          return 'row-win-status-loser';
        case 'daead2':
          return 'row-win-status-halfwin';
        case 'f1cccc':
          return 'row-win-status-halfloss';
        case 'cccccc':
          return 'row-win-status-void';
        default:
          return '';
      }
    } else if (!props.arePengindBets && row.winStatus?.label) {
      switch (row.winStatus.label) {
        case WinStatus[1]:
          return 'row-win-status-winner';
        case WinStatus[2]:
          return 'row-win-status-loser';
        case WinStatus[3]:
          return 'row-win-status-halfwin';
        case WinStatus[4]:
          return 'row-win-status-halfloss';
        case WinStatus[5]:
          return 'row-win-status-void';
        default:
          return '';
      }
    }

    return '';
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
      setRowModesModel({});
    } else {
      setRows((previousRowsModel) => {
        return previousRowsModel.map((row) => {
          if (row.id === id) {
            return {
              ...row,
              actionTypeApplied: ActionType.CANCELED,
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
            actionTypeApplied: ActionType.EDITED,
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
    const row = rows.find((row) => row.id === params.id);

    if (!row) {
      return;
    }

    let historyItemsData: {
      betId: number;
      insertStatement: string;
      history: Array<BetsHistoryItemModel>;
    } = await getBetHistory(row.id);

    setShowHistoryModal(true);
    setHistory(historyItemsData);
  };

  const handleDeleteClick = async () => {
    if (!deleteRowId) {
      return;
    }

    setIsLoading(true);

    await deleteBet({ id: deleteRowId });
    if(onTotalOfTotalAmountsChanged) {
      let calculatedTotalOfTotals = rows
        ? rows.filter((r) => r.id !== deleteRowId).reduce((accumulator, currentValue: BetModel) => {
            if (currentValue.totalAmount) {
              return accumulator + currentValue.totalAmount;
            } else {
              return accumulator;
            }
          }, 0)
        : 0;

      onTotalOfTotalAmountsChanged(calculatedTotalOfTotals);
    }

    if(onTotalProfitsChanged) {
      let calculatedTotalOfProfits = rows
        ? rows.filter((r) => r.id !== deleteRowId).reduce((accumulator, currentValue: BetModel) => {
            if (currentValue.profits) {
              return accumulator + Number(currentValue.profits);
            } else {
              return accumulator;
            }
          }, 0)
        : 0;

      onTotalProfitsChanged(calculatedTotalOfProfits);
    }

    if(onWinRateChanged) {
      const winRate: number =  rows 
        ? (rows.filter((r) => r.id !== deleteRowId && (
            r.winStatus &&  (r.winStatus.id === '1' || r.winStatus.id === '3')
          )).length/rows.length) * 100
        : 0;
      
      onWinRateChanged(winRate);
    }
    
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

  const handleChangeColorClick = async () => {
    if (!color || !colorRowId) {
      return;
    }

    setIsLoading(true);

    setRows((previousRowsModel) => {
      return previousRowsModel.map((row) => {
        if (row.id === colorRowId) {
          return {
            ...row,
            color,
          };
        } else {
          return row;
        }
      });
    });

    const row = rows.find((r) => r.id === colorRowId);
    if(!row) {
      return;
    }

    await upsertBet({ ...row, color, });
    
    setOpenColorDialog(false);

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
          profits: clickedRow.profits 
            ? Number(clickedRow.profits?.toFixed(2))
            : undefined,
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

  const onRowDoubleClick = (params: GridRowParams) => {
    const row = rows.find((row) => row.id === params.id);
    if (row) {
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [row.id]: { mode: GridRowModes.Edit },
      }));
    }
  };

  const onCellEditStop = (params: GridCellParams) => {
    // const row = rows.find((row) => row.id === params.id);
    // if (row) {
    //   handleEditClick(row.id)();
    // }
  };

  const checkAndNotifyAboutNewSportTournamentOrMarket = (props: { sport?: string;
    tournament?: string; market?: string; }) => {
    const { sport, tournament, market, } = props;
    if(sport) {
      const isExistingSport = possibleSports
        ? possibleSports.some((s) => s.label === sport)
        : false;

      if(!isExistingSport && onNewSportAdded) {
        onNewSportAdded(sport);
      }
    }

    if(market) {
      const isExistingMarket = possibleMarkets
        ? possibleMarkets.some((m) => m.label === market)
        : false;

      if(!isExistingMarket && onNewMarketAdded) {
        onNewMarketAdded(market);
      }
    }

    if(tournament) {
      const isExistingTournament = possibleTournaments
        ? possibleTournaments.some((t) => t.label === tournament)
        : false;

      if(!isExistingTournament && onNewTournamentAdded) {
        onNewTournamentAdded(tournament);
      }
    }
  };

  const processRowUpdate = async ( 
    newRow: GridRowModel<BetModel>
  ): Promise<BetModel> => {
    try {
      const currentRow = rows.find((row) => row.id === newRow.id);
      if (!currentRow) {
        return newRow;
      }

      if(!currentRow.counterAgent) {
        toast(`You should provide couteragent.`, { position: 'top-center', });

        setRowModesModel({});
        setTimeout(() => {
          setRows((previousRowsModel) => {
            return previousRowsModel.filter((row) => {
              if(row.id !== newRow!.id) {
                return row;
              }
            });
          });
        }, 500);

        return currentRow;
      }

      let atLeastOneCurrencyIsPopulated = false;
      if (currentRow.actionTypeApplied === ActionType.SAVED ||
        currentRow.actionTypeApplied === ActionType.EDITED) {

        let amounts = Object.fromEntries(Object.entries(newRow).filter(([key, value]) => key.startsWith('amount')));
        for (let key in amounts) {
          if(amounts[key] as number > 0) {
            atLeastOneCurrencyIsPopulated = true;
          }

          if (typeof amounts[key] === 'string') {
            amounts[key] = evaluate(amounts[key]);
          } else {
            amounts[key] = !!amounts[key] ? amounts[key] : 0;
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
              || !newRowData.tournament || !newRowData.market
              || !atLeastOneCurrencyIsPopulated && !newRowData.odd
          ) 
          && 
          (currentRow.winStatus && currentRow.winStatus.id !== '0')
        ) {
          setIsLoading(false);

          toast(
          `You should populate all required fields if you changed the win status.`,
          {
            position: 'top-center',
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
          setIsLoading(false);
          toast(`Some fields are not populated correctly or they are missing.`, { position: 'top-center', });

          setRowModesModel({});
          setTimeout(() => {
            setRows((previousRowsModel) => {
              return previousRowsModel.filter((row) => {
                if(row.id !== newRow!.id) {
                  return row;
                }
              });
            });
          }, 500);

          return currentRow;
        }

        if(currentRow.selection && currentRow.counterAgent) {
          let possibleSelectionsForCustomer: {
            id: number;
            selections: Array<IDropdownValue> | undefined;
          } | undefined = betsSelections.find((r) => {
            return r.id === parseInt(currentRow.counterAgent!.id);
          });

          if(possibleSelectionsForCustomer) {
            const selection = possibleSelectionsForCustomer.selections?.find((s) => {
              return s.id === currentRow.selection!.id;
            });

            if(!selection) {
              setBetsSelections((p) => {
                const betSelections = p.find((betSelections) => betSelections.id === parseInt(currentRow.counterAgent!.id));
                betSelections!.selections!
                  .push({ id: currentRow.selection!.id, label: currentRow.selection!.label, },);

                return p;
              });
            }
          } else {
            setBetsSelections((p) => {
              p.push({
                id: parseInt(currentRow.counterAgent!.id),
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
        if(onTotalOfTotalAmountsChanged) {
          let calculatedTotalOfTotals = rows
            ? rows.filter((r) => r.id !== newRow.id).reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.totalAmount) {
                return accumulator + currentValue.totalAmount;
              } else {
                return accumulator;
              }
            }, 0)
            : 0;
          calculatedTotalOfTotals += newRow.totalAmount ? newRow.totalAmount : 0;
          onTotalOfTotalAmountsChanged(calculatedTotalOfTotals);
        }

        if(onTotalProfitsChanged) {
          let calculatedTotalOfProfits = rows
            ? rows.filter((r) => r.id !== newRow.id).reduce((accumulator, currentValue: BetModel) => {
              if (currentValue.profits) {
                return accumulator + Number(currentValue.profits);
              } else {
                return accumulator;
              }
            }, 0)
            : 0;
          calculatedTotalOfProfits += newRow.profits ? Number(newRow.profits) : 0;
          onTotalProfitsChanged(calculatedTotalOfProfits);
        }

        if(onWinRateChanged) {
          const winRate: number =  rows 
            ? (rows.filter((r) => r.id !== deleteRowId && (
              r.winStatus &&  (r.winStatus.id === '1' || r.winStatus.id === '3')
            )).length/rows.length) * 100
            : 0;

          onWinRateChanged(winRate);
        }
      } else {
        setRowModesModel((previousRowModesModel) => {
          return {
            ...previousRowModesModel,
            [newRow.id]: { mode: GridRowModes.View },
          };
        });
      }

      if(currentRow.actionTypeApplied === ActionType.CANCELED) {
        toast('Canceled', { position: 'top-center', });
      } else if(currentRow.actionTypeApplied === ActionType.EDITED 
        || currentRow.actionTypeApplied === ActionType.SAVED) {
        if(!toast.isActive(`Bet_Toast`)) {
          toast(`Saved bet with id ${newRow!.id}`, {
            toastId: `Bet_Toast`,
            position: 'top-center', 
          });
        }
      }

      if(!currentRow.actionTypeApplied) {
        currentRow.actionTypeApplied = newRow.actionTypeApplied;
        return currentRow;
      } else {
        if(arePengindBets && (newRow.liveStatus && newRow.counterAgent && newRow.sport
          && newRow.tournament && newRow.market && atLeastOneCurrencyIsPopulated && newRow.odd) && 
          (newRow.winStatus && newRow.winStatus.id !== '0')
        ) {
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

        checkAndNotifyAboutNewSportTournamentOrMarket({
          sport: newRow.sport ? newRow.sport.label : undefined,
          market: newRow.market ? newRow.market.label : undefined,
          tournament: newRow.tournament ? newRow.tournament.label : undefined,
        });

        return { 
          ...newRow,
          profits: currentRow.profits,
        };
      }
    } catch(error) {
      toast(`You should provide valid parameters.`, { position: 'top-center', });

      setRowModesModel({});
      setTimeout(() => {
        setRows((previousRowsModel) => {
          return previousRowsModel.filter((row) => {
            if(row.id !== newRow!.id) {
              return row;
            }
          });
        });
      }, 500);

      return newRow;
    }
  };

  let columns: Array<GridColDef> = getBetsColumns({ 
    rows, setRows, apiRef,
    possibleCounteragents, possibleSports, possibleTournaments,
    possibleSelections: betsSelections, possibleMarkets,
    currencies, rowModesModel, id: props.id,
    isMobile, handleSaveClick, handleCancelClick, handleEditClick,
    handleHistoryClick, handleCopyBetClick, handleClickOpenOnDeleteDialog,
    handleClickOpenOnColorDialog
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
    columns = columns.filter((c) => c.headerName !== 'Profits');
  }

  insertCurrenciesIntoColumns(columns, abbreviations, apiRef);

  return (
    <Paper sx={{ paddingTop: '1%' }}>
      {
        rows 
          ? 
            (
              <>
                <DataGrid
                  apiRef={apiRef}
                  onCellKeyDown={tabKeyHandler}
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
                  rows={rows}
                  slots={{
                    toolbar: props.id === 'completed' || props.id === 'search' 
                      ? CustomToolbar 
                      : editToolbarHandler,
                  }}
                  rowModesModel={rowModesModel}
                  processRowUpdate={processRowUpdate}
                  slotProps={{
                    toolbar: { setRows, setRowModesModel, rows, currencies,  printOptions: { disableToolbarButton: true }},
                  }}
                  onRowClick={onRowClick}
                  onRowDoubleClick={props.id === 'pending' ? onRowDoubleClick : undefined}
                  // onCellEditStop={onCellEditStop}
                  editMode='row'
                  sx={{
                    height: 5400,
                    fontSize: 18,
                  }}
                />
                <Dialog
                  open={deleteDialogIsOpened}
                  onClose={handleCloseOnDeleteDialog}
                  aria-labelledby='alert-dialog-title'
                  aria-describedby='alert-dialog-description'
                >
                  <DialogTitle id='alert-dialog-title'>
                    {'Are you sure you want to delete the bet?'}
                  </DialogTitle>
                  <DialogActions>
                    <Button onClick={handleDeleteClick} autoFocus>
                      Yes
                    </Button>
                    <Button onClick={handleCloseOnDeleteDialog}>No</Button>
                  </DialogActions>
                </Dialog>
                <Dialog
                  open={colorDialogIsOpened}
                  onClose={handleCloseOnColorDialog}
                  aria-labelledby='alert-dialog-title'
                  aria-describedby='alert-dialog-description'
                >
                  <DialogTitle id='alert-dialog-title'>
                    <Paper sx={{
                      display: 'flex'
                    }}>
                      <Button 
                        sx={{ 
                          border: '1px solid white',
                          width: '200px',
                          height: '200px',
                          marginRight: '10px',
                        }} 
                        className='row-win-status-winner' 
                        onClick={() => {
                          setColor('b9d7a6')
                        }}
                      />
                      <Button 
                        sx={{ 
                          border: '1px solid white',
                          width: '200px',
                          height: '200px',
                          marginRight: '10px',
                        }} 
                        className='row-win-status-loser' 
                        onClick={() => {
                          setColor('d86564')
                        }}
                      />
                      <Button 
                        sx={{ 
                          border: '1px solid white',
                          width: '200px',
                          height: '200px',
                          marginRight: '10px',
                        }} 
                        className='row-win-status-halfwin' 
                        onClick={() => {
                          setColor('daead2')
                        }}
                      />
                      <Button 
                        sx={{ 
                          border: '1px solid white',
                          width: '200px',
                          height: '200px',
                          marginRight: '10px',
                        }} 
                        className='row-win-status-halfloss' 
                        onClick={() => {
                          setColor('f1cccc')
                        }}
                      />
                      <Button 
                        sx={{ 
                          border: '1px solid white',
                          width: '200px',
                          height: '200px',
                          marginRight: '10px',
                        }} 
                        className='row-win-status-void' 
                        onClick={() => {
                          setColor('cccccc')
                        }}
                      />
                    </Paper>
                  </DialogTitle>
                  <DialogActions>
                    <Button onClick={handleChangeColorClick} autoFocus>
                      Yes
                    </Button>
                    <Button onClick={handleCloseOnColorDialog}>
                      No
                    </Button>
                  </DialogActions>
                </Dialog>
              </>
            ) 
            : null
      }
    </Paper>
  );
}

export default React.memo(Bets);
