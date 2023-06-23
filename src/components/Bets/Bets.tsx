import * as React from "react";
import { toast } from "react-toastify";
import { isMobile } from "react-device-detect";
import {
  DataGridPro,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowParams,
  GridToolbarContainer,
  GridValueGetterParams,
  GridValueSetterParams,
} from "@mui/x-data-grid-pro";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Paper,
  TextField,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import CancelIcon from "@mui/icons-material/Close";
import {
  BetModel,
  EditToolbarProps,
  Enums,
  IDropdownValue,
  ISelectionsResult,
} from "../../models";
import { deleteBet, upsertBet, getBetHistory } from "../../api";
import { BetStatus, WinStatus, LiveStatus } from "../../models/enums";
import { Currency } from "../../database-models";
import Modal from "../UI/Modal";

const getAbbreviations = (currencies: Currency[] | undefined) => {
  if (!currencies) return [];
  return currencies.map((cur) => cur.abbreviation);
};
const insertCurrenciesIntoColumns = (columns: any, abbreviations: string[]) => {
  const idx = columns.findIndex((c: any) => c.field === "psLimit");
  const currencyColumns = abbreviations.map((a) => ({
    field: `amount${a}`,
    headerName: a,
    type: "number",
    editable: true,
    width: 150,
  }));
  columns.splice(idx + 1, 0, ...currencyColumns);
};
function Bets(props: {
  isRead: boolean;
  arePengindBets: boolean;
  selectBetIdFn: (id: number) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;

  defaultRows: Array<BetModel> | undefined;
  currencies: Array<Currency> | undefined;

  possibleCounteragents: Array<IDropdownValue> | undefined;
  allSelections: ISelectionsResult;
  possibleSports: Array<IDropdownValue> | undefined;
  possibleTournaments: Array<IDropdownValue> | undefined;
  possibleMarkets: Array<IDropdownValue> | undefined;
}) {
  const {
    isRead,
    selectBetIdFn,
    setIsLoading,
    defaultRows,
    currencies,
    possibleCounteragents,
    allSelections,
    possibleSports,
    possibleTournaments,
    possibleMarkets,
  } = props;

  const [rows, setRows] = React.useState<Array<BetModel>>(
    defaultRows ? defaultRows : []
  );
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  const [copiedRowIds, setCopiedRowIds] = React.useState<
    [number, number] | null
  >(null);
  const [deleteRowId, setDeleteRowId] = React.useState<number | undefined>(
    undefined
  );
  const [deleteDialogIsOpened, setOpenDeleteDialog] = React.useState(false);
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  const [history, setHistory] = React.useState(null);

  const abbreviations = getAbbreviations(currencies);

  React.useEffect(() => {
    setRows((oldRows) => {
      return defaultRows ? defaultRows : [];
    });

    setRowModesModel(() => {
      return {};
    });
  }, [defaultRows]);

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
    setCopiedRowIds(null);
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

  const handleCancelClick = (id: GridRowId) => () => {
    setCopiedRowIds(null);
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
      newRowsModel[id] = { mode: GridRowModes.Edit };
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
          profits: clickedRow.profits,
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
    setCopiedRowIds([randomId, clickedRow.id]);
  };

  const onRowClick = (params: GridRowParams) => {
    const row = rows.find((row) => row.id === params.id);
    if (row) {
      selectBetIdFn(row.id);
    }
  };

  //#endregion Actions handlers

  //#region Rows update handler

  const processRowUpdate = async (
    newRow: GridRowModel<BetModel>
  ): Promise<BetModel> => {
    const currentRow = rows.find((row) => row.id === newRow.id);
    if (!currentRow) {
      return newRow;
    }

    if (
      currentRow.actionTypeApplied === Enums.ActionType.SAVED ||
      currentRow.actionTypeApplied === Enums.ActionType.EDITED
    ) {
      const amounts = Object.fromEntries(Object.entries(newRow).filter(([key, value]) => key.startsWith('amount')));
      const newRowData: BetModel = {
        ...currentRow,
        dateCreated: newRow.dateCreated,
        betStatus: currentRow.betStatus,
        winStatus: currentRow.winStatus,
        liveStatus: currentRow.liveStatus,
        counterAgent: currentRow.counterAgent,
        sport: currentRow.sport,
        tournament: currentRow.tournament,
        market: currentRow.market,

        stake: newRow.stake,
        psLimit: newRow.psLimit,
        ...amounts,
        totalAmount: newRow.totalAmount,
        odd: newRow.odd,
        dateFinished: new Date(),
        profits: newRow.profits,
        notes: newRow.notes,

        selection: newRow.selection,
      };
      debugger;
      setIsLoading(true);

      const rowData = await upsertBet(newRowData);
      if (!rowData || !rowData.data) {
        return newRow;
      }

      setRows((previousRowsModel) => {
        return previousRowsModel.map((row) => {
          if (row.id === newRow.id) {
            return {
              ...newRowData,
              id: rowData.data.id,
              totalAmount: rowData.data.totalAmount,

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

    return newRow;
  };

  //#endregion Rows update handler

  const handleChange = (e: any, value: any, params: any) => {
    setRows((previousRowsModel) => {
      return previousRowsModel.map((row: BetModel) => {
        if (row.id === params.row.id) {
          return {
            ...row,
            betStatus: value
              ? typeof value === "string"
                ? { id: value, label: value }
                : value
              : undefined,
          };
        } else {
          return row;
        }
      });
    });
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "Tab": {
        const editableRow = document.querySelector(
          ".MuiDataGrid-row--editable"
        );
        if (!editableRow) return;
        (editableRow.childNodes[2] as HTMLElement).focus();
        break;
      }
      default:
    }
  };
  let columns: Array<GridColDef> = [
    {
      field: "id",
      type: "number",
      valueGetter: (params) => {
        const row = rows?.find((r) => r.id === params.id);
        if (!row) {
          return null;
        }
        if (!row.isSavedInDatabase) {
          return null;
        }
        return params.id;
      },
    },
    {
      field: "dateCreated",
      headerName: "Date created",
      type: "date",
      editable: false,
      width: 150,
      renderCell: (params) => {
        const row = rows ? rows.find((r) => r.id === params.id) : undefined;

        if (!row) {
          throw Error(`Row did not found.`);
        }

        return (
          <Tooltip
            title={`${row.dateCreated.toLocaleDateString()} - ${row.dateCreated.toLocaleTimeString()}`}
          >
            <span>{row.dateCreated.toLocaleDateString()}</span>
          </Tooltip>
        );
      },
    },
    {
      field: "betStatus",
      headerName: "Bet status",
      editable: true,
      width: 300,
      renderCell: (params: GridRenderCellParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return <>{row.betStatus ? row.betStatus.label : ""}</>;
      },
      renderEditCell: (params: GridRenderEditCellParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return (
          <Autocomplete
            options={[
              { id: "0", label: BetStatus[0] },
              { id: "1", label: BetStatus[1] },
            ]}
            renderInput={(params) => {
              params.inputProps.onKeyDown = handleKeyDown;
              return <TextField {...params} />;
            }}
            onChange={(e, value) => handleChange(e, value, params)}
            value={row.betStatus}
            sx={{
              width: 300,
            }}
          />
        );
      },
      valueGetter: (params: GridValueGetterParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return row.betStatus;
      },
    },
    {
      field: "winStatus",
      headerName: "Win status",
      editable: true,
      width: 300,
      renderCell: (params: GridRenderCellParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return <>{row.winStatus ? row.winStatus.label : ""}</>;
      },
      renderEditCell: (params: GridRenderEditCellParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return (
          <Autocomplete
            options={[
              { id: "0", label: WinStatus[0] },
              { id: "1", label: WinStatus[1] },
              { id: "2", label: WinStatus[2] },
              { id: "3", label: WinStatus[3] },
              { id: "4", label: WinStatus[4] },
              { id: "5", label: WinStatus[5] },
            ]}
            renderInput={(params) => <TextField {...params} />}
            onChange={(e, value: any) => {
              setRows((previousRowsModel) => {
                return previousRowsModel.map((row: BetModel) => {
                  if (row.id === params.row.id) {
                    return {
                      ...row,
                      winStatus: value
                        ? typeof value === "string"
                          ? { id: value, label: value }
                          : value
                        : undefined,
                    };
                  } else {
                    return row;
                  }
                });
              });
            }}
            value={row.winStatus}
            sx={{
              width: 300,
            }}
          />
        );
      },
      valueGetter: (params: GridValueGetterParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return row.winStatus;
      },
    },
    {
      field: "liveStatus",
      headerName: "Live status",
      editable: true,
      width: 300,
      renderCell: (params: GridRenderCellParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return <>{row.liveStatus ? row.liveStatus.label : ""}</>;
      },
      renderEditCell: (params: GridRenderEditCellParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return (
          <Autocomplete
            options={[
              { id: "0", label: LiveStatus[0] },
              { id: "1", label: LiveStatus[1] },
              { id: "2", label: LiveStatus[2] },
              { id: "3", label: LiveStatus[3] },
            ]}
            renderInput={(params) => <TextField {...params} />}
            onChange={(e, value: any) => {
              setRows((previousRowsModel) => {
                return previousRowsModel.map((row: BetModel) => {
                  if (row.id === params.row.id) {
                    return {
                      ...row,
                      liveStatus: value
                        ? typeof value === "string"
                          ? { id: value, label: value }
                          : value
                        : undefined,
                    };
                  } else {
                    return row;
                  }
                });
              });
            }}
            value={row.liveStatus}
            sx={{
              width: 300,
            }}
          />
        );
      },
      valueGetter: (params: GridValueGetterParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return row.liveStatus;
      },
    },
    {
      field: "counterAgent",
      headerName: "Counteragent",
      editable: true,
      width: 300,
      renderCell: (params: GridRenderCellParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return <>{row.counterAgent ? row.counterAgent.label : ""}</>;
      },
      renderEditCell: (params: GridRenderEditCellParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return (
          <Autocomplete
            options={possibleCounteragents ? possibleCounteragents : []}
            renderInput={(params) => <TextField {...params} />}
            onChange={(e, value: any) => {
              setRows((previousRowsModel) => {
                return previousRowsModel.map((row: BetModel) => {
                  if (row.id === params.row.id) {
                    return {
                      ...row,
                      counterAgent: value
                        ? typeof value === "string"
                          ? { id: value, label: value }
                          : value
                        : undefined,
                    };
                  } else {
                    return row;
                  }
                });
              });
            }}
            value={row.counterAgent}
            sx={{
              width: 300,
            }}
          />
        );
      },
      valueGetter: (params: GridValueGetterParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return row.counterAgent;
      },
    },
    {
      field: "sport",
      headerName: "Sport",
      editable: true,
      width: 300,
      renderCell: (params: GridRenderCellParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return <>{row.sport ? row.sport.label : ""}</>;
      },
      renderEditCell: (params: GridRenderEditCellParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return (
          <Autocomplete
            freeSolo
            options={possibleSports ? possibleSports : []}
            renderInput={(params) => <TextField {...params} />}
            onChange={(e, value: any) => {
              setRows((previousRowsModel) => {
                return previousRowsModel.map((row: BetModel) => {
                  if (row.id === params.row.id) {
                    const sport = value
                      ? typeof value === "string"
                        ? { id: value, label: value }
                        : value
                      : undefined;

                    return {
                      ...row,
                      sport,
                    };
                  } else {
                    return row;
                  }
                });
              });
            }}
            value={row.sport}
            sx={{
              width: 300,
            }}
          />
        );
      },
      valueGetter: (params: GridValueGetterParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return row.sport;
      },
    },
    {
      field: "tournament",
      headerName: "Tournament",
      editable: true,
      width: 300,
      renderCell: (params: GridRenderCellParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return <>{row.tournament ? row.tournament.label : ""}</>;
      },
      renderEditCell: (params: GridRenderEditCellParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return (
          <Autocomplete
            freeSolo
            options={possibleTournaments ? possibleTournaments : []}
            renderInput={(params) => <TextField {...params} />}
            onChange={(e, value: any) => {
              setRows((previousRowsModel) => {
                return previousRowsModel.map((row: BetModel) => {
                  if (row.id === params.row.id) {
                    const tournament = value
                      ? typeof value === "string"
                        ? { id: value, label: value }
                        : value
                      : undefined;

                    return {
                      ...row,
                      tournament,
                    };
                  } else {
                    return row;
                  }
                });
              });
            }}
            value={row.tournament}
            sx={{
              width: 300,
            }}
          />
        );
      },
      valueGetter: (params: GridValueGetterParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return row.tournament;
      },
    },
    {
      field: "market",
      headerName: "Market",
      editable: true,
      width: 300,
      renderCell: (params: GridRenderCellParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return <>{row.market ? row.market.label : ""}</>;
      },
      renderEditCell: (params: GridRenderEditCellParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return (
          <Autocomplete
            freeSolo
            options={possibleMarkets ? possibleMarkets : []}
            renderInput={(params) => <TextField {...params} />}
            onChange={(e, value: any) => {
              setRows((previousRowsModel) => {
                return previousRowsModel.map((row: BetModel) => {
                  if (row.id === params.row.id) {
                    const market = value
                      ? typeof value === "string"
                        ? { id: value, label: value }
                        : value
                      : undefined;

                    return {
                      ...row,
                      market,
                    };
                  } else {
                    return row;
                  }
                });
              });
            }}
            value={row.market}
            sx={{
              width: 300,
            }}
          />
        );
      },
      valueGetter: (params: GridValueGetterParams<BetModel>) => {
        const row = rows.find((r) => r.id === params.row.id);
        if (!row) {
          return;
        }

        return row.market;
      },
    },
    {
      field: "stake",
      headerName: "Stake",
      type: "number",
      editable: true,
      width: 150,
    },
    {
      field: "psLimit",
      headerName: "PS Limit",
      type: "number",
      editable: true,
      width: 150,
    },
    {
      field: "totalAmount",
      headerName: "Total amount",
      type: "number",
      editable: false,
      width: 150,
      valueGetter: (params) => {
        if (!currencies || currencies.length === 0) {
          return 0;
        }

        const totalAmount = !isNaN(params.row.totalAmount);
        return params.row && params.row.totalAmount
          ? params.row.totalAmount
          : totalAmount;
      },
    },
    {
      field: "odd",
      headerName: "Odd",
      type: "number",
      editable: true,
      width: 150,
    },
    {
      field: "dateFinished",
      headerName: "Date finished",
      type: "date",
      editable: false,
      width: 150,
    },
    {
      field: "profits",
      headerName: "P/L",
      type: "number",
      editable: false,
      width: 150,
    },
    {
      field: "notes",
      headerName: "Notes",
      type: "string",
      editable: true,
      width: 150,
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 150,
      cellClassName: "actions",
      getActions: (params) => {
        const isInEditMode =
          rowModesModel[params.id]?.mode === GridRowModes.Edit;
        if (isRead) {
          return [];
        } else {
          const isAnyOtherRowInEditMode = rows?.some((r) => {
            if (r.id === params.id) {
              return false;
            }

            const rowModeData = rowModesModel[r.id];
            return rowModeData && rowModeData.mode === GridRowModes.Edit;
          });

          if (isAnyOtherRowInEditMode) {
            return [];
          }

          return isInEditMode
            ? !isMobile
              ? [
                  <GridActionsCellItem
                    icon={<SaveIcon />}
                    label="Save"
                    onClick={handleSaveClick(params.id)}
                  />,
                  <GridActionsCellItem
                    icon={<CancelIcon />}
                    label="Cancel"
                    className="textPrimary"
                    onClick={handleCancelClick(params.id)}
                    color="inherit"
                  />,
                ]
              : []
            : !isMobile
            ? [
                <GridActionsCellItem
                  icon={<EditIcon />}
                  label="Edit"
                  className="textPrimary"
                  onClick={handleEditClick(params.id)}
                  color="inherit"
                />,
                <GridActionsCellItem
                  icon={<HistoryIcon />}
                  label="Bet History"
                  className="textPrimary"
                  onClick={() => handleHistoryClick(params) as any}
                  color="inherit"
                />,
                <GridActionsCellItem
                  icon={<DeleteIcon />}
                  label="Delete"
                  onClick={handleClickOpenOnDeleteDialog(params.id)}
                  color="inherit"
                />,
                <GridActionsCellItem
                  icon={<AddIcon />}
                  label="Copy bet"
                  onClick={handleCopyBetClick(params.id)}
                  color="inherit"
                />,
              ]
            : [
                <GridActionsCellItem
                  icon={<HistoryIcon />}
                  label="Bet History"
                  className="textPrimary"
                  onClick={() => handleHistoryClick(params) as any}
                  color="inherit"
                />,
              ];
        }
      },
    },
  ];

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
          <DataGridPro
            columns={columns}
            getRowClassName={(params) => {
              if (!copiedRowIds) return "";
              if (copiedRowIds.includes(params.row.id)) {
                return `super-app-theme--edit`;
              }
              return "";
            }}
            columnBuffer={2}
            columnThreshold={2}
            rows={rows}
            slots={{
              toolbar: isRead ? undefined : EditToolbar,
            }}
            rowModesModel={rowModesModel}
            processRowUpdate={processRowUpdate}
            slotProps={{
              toolbar: { setRows, setRowModesModel },
            }}
            onRowClick={onRowClick}
            editMode="row"
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
                Ok
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
