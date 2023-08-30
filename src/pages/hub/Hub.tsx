import React, { useEffect } from "react";
import {
  // Box,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Button,
  Switch,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

import Bets from "../../components/Bets/Bets";
import {
  BetModel,
  ExpenseModel,
  IDropdownValue,
  ISelectionsResult,
  StatisticItemModel,
} from "../../models";
import {
  getBetStatistics,
  getCompletedBets,
  getCounterAgents,
  getCurrencies,
  getExpenses,
  getMarkets,
  getPendingBets,
  getSports,
  getTournaments,
} from "../../api";
import { Currency, Expense, Statistics } from "../../database-models";
import { StatisticType } from "../../models/enums";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Expenses from "../../components/Expenses/Expenses";
import { betToBetModelMapper } from "../../utils";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function Hub() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSticky, setIsSticky]=React.useState<boolean>(false);
  const [isOpenedCalendar, setIsOpenedCalendar]=React.useState<boolean>(true);

  const [selectedBetId, setSelectedBetId] = React.useState<number | undefined>(
    undefined
  );
  const [statisticsType, setStatisticsType] = React.useState<StatisticType>(
    StatisticType.Flat
  );
  const [currentStatistcs, setCurrentStatistcs] = React.useState<
    Array<StatisticItemModel> | undefined
  >(undefined);
  const [isPendingTableExpanded, setPendingTableExpanded] =
    React.useState<boolean>(true);
  const [isCompletedTableExpanded, setCompletedTableExpanded] =
    React.useState<boolean>(true);
  const [isExpensesTableExpanded, setExpensesTableExpanded] =
    React.useState<boolean>(true);

  const [date, setDate] = React.useState<Date | undefined>(undefined);

  const [currencies, setCurrencies] = React.useState<
    Array<Currency> | undefined
  >(undefined);
  const [pendingRows, setPendingRows] = React.useState<
    Array<BetModel> | undefined
  >(undefined);
  const [completedRows, setCompletedRows] = React.useState<
    Array<BetModel> | undefined
  >(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filteredPendingRows, setFilteredPendingRows] = React.useState<
    Array<BetModel> | undefined
  >(undefined);
  const [filteredCompletedRows, setFilteredCompletedRows] = React.useState<
    Array<BetModel> | undefined
  >(undefined);
  const [possibleCounterAgents, setCounterAgents] = React.useState<
    Array<IDropdownValue> | undefined
  >(undefined);
  const [possibleSports, setSports] = React.useState<
    Array<IDropdownValue> | undefined
  >(undefined);
  const [possibleTournaments, setTournaments] = React.useState<
    Array<IDropdownValue> | undefined
  >(undefined);
  const [possibleMarkets, setMarkets] = React.useState<
    Array<IDropdownValue> | undefined
  >(undefined);
  const [possibleSelections, setSelections] = React.useState<
    ISelectionsResult | undefined
  >(undefined);
  const [expensesRows, setExpensesRows] = React.useState<
    Array<ExpenseModel> | undefined
  >(undefined);

  const sortExpenses = () => {
    let sortedExpenses: Array<ExpenseModel> = [];
    if(expensesRows && date) {
      const selectedDateExpenses: Array<ExpenseModel> = expensesRows.filter((expense) => {
        return date.getFullYear() === expense.dateCreated.getFullYear()
          && date.getMonth() === expense.dateCreated.getMonth()
          && date.getDate() === expense.dateCreated.getDate();
      });

      const notSelectedDateExpenses: Array<ExpenseModel> = expensesRows.filter((expense) => {
        return date.getFullYear() !== expense.dateCreated.getFullYear()
          || date.getMonth() !== expense.dateCreated.getMonth()
          || date.getDate() !== expense.dateCreated.getDate();
      });

      const sortedNotSelectedDateExpenses 
        = notSelectedDateExpenses
          .sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime());

      sortedExpenses = selectedDateExpenses.concat(sortedNotSelectedDateExpenses);
    } else if (expensesRows) {
      sortedExpenses = expensesRows;
    }
    setExpensesRows(sortedExpenses);
  }

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        let currencies: Array<Currency> | undefined = await getCurrencies();
        let pendingBets: Array<BetModel> = (await getPendingBets())!.map(
          betToBetModelMapper
        );
        let completedBets: Array<BetModel> = (await getCompletedBets())!.map(
          betToBetModelMapper
        );
        const getCounteragentsResult = await getCounterAgents();
        // const getSelectionsResult = await getSelections();
        const getSelectionsResult = {
          "1": ["Selection 1"],
          "2": ["Selection 1", "Selection 2"],
          "3": ["Selection 1", "Selection 2", "Selection 3"],
          "4": ["Selection 1", "Selection 2", "Selection 3", "Selection 4"],
          "5": [
            "Selection 1",
            "Selection 2",
            "Selection 3",
            "Selection 4",
            "Selection 5",
          ],
        };
        setSelections(getSelectionsResult);
        const getSportsResult = await getSports();
        const getTournamentsResult = await getTournaments();
        const getMarketsResult = await getMarkets();

        const getAllExpenses: Array<Expense> | undefined = await getExpenses();
        setIsLoading(false);

        setPendingRows(pendingBets);
        setCompletedRows(completedBets);
        setCurrencies(currencies);
        setFilteredPendingRows(
          pendingBets.filter((b) => {
            const now = new Date();
            return (
              b.dateFinished &&
              b.dateFinished.getFullYear() === now.getFullYear() &&
              b.dateFinished.getMonth() === now.getMonth() &&
              b.dateFinished.getDate() === now.getDate()
            );
          })
        );
        setFilteredCompletedRows(
          completedBets.filter((b) => {
            const now = new Date();
            return (
              b.dateFinished &&
              b.dateFinished.getFullYear() === now.getFullYear() &&
              b.dateFinished.getMonth() === now.getMonth() &&
              b.dateFinished.getDate() === now.getDate()
            );
          })
        );

        const counterAgents: Array<IDropdownValue> | undefined =
          getCounteragentsResult
            ? getCounteragentsResult.map((counterAgent: any) => {
                return {
                  id: counterAgent.id.toString(),
                  label: counterAgent.name,
                };
              })
            : [];

        setCounterAgents(counterAgents);

        const sports: Array<IDropdownValue> | undefined = getSportsResult
          ? getSportsResult.map((sport) => {
              return {
                id: sport,
                label: sport,
              };
            })
          : [];
        setSports(sports);

        const markets: Array<IDropdownValue> | undefined = getMarketsResult
          ? getMarketsResult.map((market) => {
              return {
                id: market,
                label: market,
              };
            })
          : [];
        setMarkets(markets);

        const tournaments: Array<IDropdownValue> | undefined =
          getTournamentsResult
            ? getTournamentsResult.map((tournament) => {
                return {
                  id: tournament,
                  label: tournament,
                };
              })
            : [];
        setTournaments(tournaments);

        const expenses: Array<ExpenseModel> | undefined = getAllExpenses
          ? getAllExpenses.map((expense) => {
              return {
                id: expense.id,
                counterAgent: expense.counteragent
                  ? {
                      id: expense.counteragent.id.toString(),
                      label: expense.counteragent.name,
                    }
                  : undefined,
                amount: Number(expense.amount.toFixed(2)),
                description: expense.description,
                dateCreated: new Date(expense.dateCreated),

                actionTypeApplied: undefined,
                isSavedInDatabase: true,
              };
            })
          : [];

        setExpensesRows(expenses);
        setDate(new Date());
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    setFilteredPendingRows((previousRowsModel: Array<BetModel> | undefined) => {
      if (pendingRows && date) {
        const bets: Array<BetModel> = [];
        for (var i = 0; i <= pendingRows?.length - 1; i++) {
          const currentRow = pendingRows[i];
          if (
            currentRow.dateFinished &&
            currentRow.dateFinished.getFullYear() === date.getFullYear() &&
            currentRow.dateFinished.getMonth() === date.getMonth() &&
            currentRow.dateFinished.getDate() === date.getDate()
          ) {
            bets.push(currentRow);
          }
        }

        return bets;
      } else {
        return [];
      }
    });

    setFilteredCompletedRows(
      (previousRowsModel: Array<BetModel> | undefined) => {
        if (completedRows && date) {
          const bets: Array<BetModel> = [];
          for (var i = 0; i <= completedRows?.length - 1; i++) {
            const currentRow = completedRows[i];
            if (
              currentRow.dateFinished &&
              currentRow.dateFinished.getFullYear() === date.getFullYear() &&
              currentRow.dateFinished.getMonth() === date.getMonth() &&
              currentRow.dateFinished.getDate() === date.getDate()
            ) {
              bets.push(currentRow);
            }
          }

          return bets;
        } else {
          return [];
        }
      }
    );

    sortExpenses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  useEffect(() => {
    (async () => {
      try {
        if (!selectedBetId) {
          return;
        }

        let betStatistics: Statistics | undefined = await getBetStatistics({
          id: selectedBetId,
          type: statisticsType,
        });

        if (!betStatistics) {
          return;
        }

        const statisticsModel: Array<StatisticItemModel> = [
          {
            id: 1,
            periodType: "today",
            profit: betStatistics.current.profit,
            turnOver: betStatistics.current.turnOver,
            winRate: (betStatistics.current.winRate * 100) + '%',
            yield: (betStatistics.current.yield * 100) + '%',
          },
          {
            id: 2,
            periodType: "last 3m",
            profit: betStatistics.threeMonths.profit,
            turnOver: betStatistics.threeMonths.turnOver,
            winRate: (betStatistics.threeMonths.winRate * 100) + '%',
            yield: (betStatistics.threeMonths.yield * 100) + '%',
          },
          {
            id: 3,
            periodType: "last 6m",
            profit: betStatistics.sixMonths.profit,
            turnOver: betStatistics.sixMonths.turnOver,
            winRate: (betStatistics.sixMonths.winRate * 100) + '%',
            yield: (betStatistics.sixMonths.yield * 100) + '%',
          },
        ];

        setCurrentStatistcs(statisticsModel);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedBetId, statisticsType]);

  const selectedDateFn = (value: Date | null) => {
    setDate((value! as any).$d as Date);
  };

  const selectBetId = async (id: number) => {
    setSelectedBetId(id);
    return id;
  };

  const savedPendingBet = async (bets: Array<BetModel>, bet: BetModel) => {
    setPendingRows((previousRowsModel) => {
      if(!bets) {
        return [];
      }
      
      return bets!.filter((row) => {
        return row.id !== bet.id;
      });
    });

    setCompletedRows((previousRowsModel) => {
      if(!previousRowsModel) {
        return [
          bet,
        ];
      }

      const existingBet = previousRowsModel.find((b) => b.id === bet.id);
      if(!existingBet) {
        previousRowsModel.push(bet);
      }
      
      return previousRowsModel;
    });

    if(completedRows) {
      setFilteredCompletedRows(
        completedRows.filter((b) => {
          const now = new Date();
          return (
            b.dateFinished &&
            b.dateFinished.getFullYear() === now.getFullYear() &&
            b.dateFinished.getMonth() === now.getMonth() &&
            b.dateFinished.getDate() === now.getDate()
          );
        })
      );
    } else {
      setFilteredCompletedRows([]);
    }
    
    return;
  }

  const statisticsColumns: Array<GridColDef<any>> = [
    {
      field: "id",
      type: "number",
    },
    {
      field: "periodType",
      headerName: "Period",
      type: "string",
      width: 100,
    },
    {
      field: "profit",
      headerName: "Profit",
      type: "number",
      width: 100,
    },
    {
      field: "turnOver",
      headerName: "Turnover",
      type: "number",
      width: 100,
    },
    {
      field: "winRate",
      headerName: "Win Rate",
      type: "number",
      width: 100,
    },
    {
      field: "yield",
      headerName: "Yield",
      type: "number",
      width: 70,
    },
  ];

  const handleExpandClick = () => {
    setPendingTableExpanded(!isPendingTableExpanded);
  };

  const handleExpandClickCompleted = () => {
    setCompletedTableExpanded(!isCompletedTableExpanded);
  };

  const handleExpandClickExpenses = () => {
    setExpensesTableExpanded(!isExpensesTableExpanded);
  };

  return (
    <>
{isLoading ? (
      <>
      <div className="background-color-blur">
      <CircularProgress
          color="success"
          size={250}
          disableShrink={true}
          style={{
            position: 'fixed', 
            top: '0', 
            right: '0',
            bottom: '0',
            left: '0',
            margin: 'auto',
            zIndex: 9999999999999,
            transition: 'none',
          }}
        />
      </div>
        
      </>
    ) : null}

      <Paper sx={{ padding: "5%" ,width:"100% !important"}}>

        <Paper className="parent-statistics" style={{ maxWidth: "70vw !important", display: "flex", zIndex: "1", top: "60px", position: isSticky ? "sticky" : "static" }}>
          <Paper className="statistics" style={{ marginRight: "10%", }}>
            <Typography variant="h4">Statistics</Typography>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={statisticsType}
                onChange={(event) => {
                  const value: string = (event.target as HTMLInputElement).value;
                  setStatisticsType(
                    value === "Flat" ? StatisticType.Flat : StatisticType.Real
                  );
                }}
              >
                <FormControlLabel value="Flat" control={<Radio />} label="Flat" />
                <FormControlLabel value="Real" control={<Radio />} label="Real" />
              </RadioGroup>

              <FormControlLabel
                onChange={() => {
                  setIsSticky(!isSticky)
                  console.log(isSticky)
                }} control={<Checkbox />} label="Sticky" />
            </div>
            <DataGrid style={{ height: "70%", borderWidth: "0" }} columns={statisticsColumns}
              rows={currentStatistcs || []}
              pageSizeOptions={[]}
              autoPageSize={false}
              hideFooterPagination
            />
          </Paper>
          <Paper className="calendar-container">
            <div className="switch-calendar">
              <FormControlLabel onClick={() => {
                setIsOpenedCalendar(!isOpenedCalendar)
              }} control={<Switch defaultChecked />} label="Calendar" />
            </div>
            <div style={{ display: isOpenedCalendar ? "flex" : "none" }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar onChange={selectedDateFn} />
              </LocalizationProvider>
            </div>
          </Paper>
        </Paper>

      <Paper  style={{ display: "flex", flexWrap: "nowrap" }}>
          <Paper style={{width:"100%"}}>
            {pendingRows ? (
              <>
                <Grid item xs={12} sx={{ maxWidth: "90vw !important" }}>
                  <Typography variant="h4">
                    PENDING
                    <IconButton
                      onClick={handleExpandClick}
                      aria-expanded={isPendingTableExpanded}
                      aria-label="show more"
                      sx={{
                        transform: isPendingTableExpanded
                          ? "rotate(0deg)"
                          : "rotate(180deg)",
                        transition: "transform 0.3s",
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Typography>
                  <Collapse
                    in={isPendingTableExpanded}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Bets
                      id="pending"
                      arePengindBets={true}
                      savedBet={savedPendingBet}
                      isRead={false}
                      selectBetIdFn={selectBetId}
                      setIsLoading={setIsLoading}
                      defaultRows={pendingRows}
                      currencies={currencies}
                      possibleCounteragents={possibleCounterAgents}
                      possibleSports={possibleSports}
                      possibleTournaments={possibleTournaments}
                      possibleMarkets={possibleMarkets}
                      allSelections={possibleSelections ? possibleSelections : {}}
                    />
                  </Collapse>
                </Grid>
              </>
            ) : null}
          {filteredCompletedRows ? (
  <>
      <Grid item xs={12} sx={{ maxWidth: "90vw !important" }}>
        <Typography variant="h4">
          COMPLETED
          <IconButton
            onClick={handleExpandClickCompleted}
            aria-expanded={isCompletedTableExpanded}
            aria-label="show more"
            sx={{
              transform: isCompletedTableExpanded
                ? "rotate(0deg)"
                : "rotate(180deg)",
              transition: "transform 0.3s",
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Typography>
        <Collapse in={isCompletedTableExpanded} timeout="auto" unmountOnExit>
          {/* <Grid container spacing={3}> */}
          {/* <Grid item xs={11} sx={{ maxWidth: "70vw !important" }}> */}
          <Bets
            id="completed"
            arePengindBets={false}
            savedBet={savedPendingBet}
            isRead={true}
            selectBetIdFn={selectBetId}
            setIsLoading={setIsLoading}
            defaultRows={filteredCompletedRows}
            currencies={currencies}
            possibleCounteragents={possibleCounterAgents}
            possibleSports={possibleSports}
            possibleTournaments={possibleTournaments}
            possibleMarkets={possibleMarkets}
            allSelections={possibleSelections ? possibleSelections : {}}
          />
        </Collapse>
      </Grid>
  </>
) : null}

          </Paper>
        </Paper>

        {expensesRows ? (
          <>
            <Grid item xs={12} sx={{ maxWidth: "90vw !important" }}>
              <Typography variant="h4">
                Expenses
                <IconButton
                  onClick={handleExpandClickExpenses}
                  aria-expanded={isExpensesTableExpanded}
                  aria-label="show more"
                  sx={{
                    transform: isExpensesTableExpanded
                      ? "rotate(0deg)"
                      : "rotate(180deg)",
                    transition: "transform 0.3s",
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Typography>
              <Collapse sx={{ maxWidth: "90vw !important" }} in={isExpensesTableExpanded} timeout="auto" unmountOnExit>
                <Expenses
                  displayExportToolbar={false}
                  isRead={false}
                  setIsLoading={setIsLoading}
                  defaultRows={expensesRows}
                  possibleCounterAgents={possibleCounterAgents}
                />
              </Collapse>
            </Grid>
          </>
        ) : null}
      </Paper>
    </>

  );
}
