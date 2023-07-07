import { Bet, CurrencyAmount } from "../database-models";
import { BetModel } from "../models";
import { BetStatus, LiveStatus, WinStatus } from "../models/enums";

export const betToBetModelMapper = (bet: Bet) => {
  let currencyAmounts: Record<string, number> = {};

  if (bet.currencyAmounts) {
    bet.currencyAmounts.forEach((currencyAmount: CurrencyAmount) => {
      currencyAmounts[`amount${currencyAmount.abbreviation}`] = currencyAmount.amount;
    });
  }

  return {
    id: bet.id,
    dateCreated: new Date(bet.dateCreated),
    betStatus: {
      id: bet.betStatus.toString(),
      label: BetStatus[bet.betStatus],
    },
    winStatus: {
      id: bet.winStatus.toString(),
      label: WinStatus[bet.winStatus],
    },
    stake: bet.stake,
    counterAgent: bet.counteragent
      ? { id: bet.counteragent.id.toString(), label: bet.counteragent.name }
      : undefined,
    counterAgentCategory:
      bet.counteragent && bet.counteragent.counteragentCategory
        ? {
            id: bet.counteragent.counteragentCategory.id.toString(),
            label: bet.counteragent.counteragentCategory.name,
          }
        : undefined,
    sport: bet.sport ? { id: bet.sport, label: bet.sport } : undefined,
    liveStatus: {
      id: bet.liveStatus.toString(),
      label: LiveStatus[bet.liveStatus],
    },
    psLimit: bet.psLimit,
    market: bet.market ? { id: bet.market, label: bet.market } : undefined,
    tournament: bet.tournament
      ? { id: bet.tournament, label: bet.tournament }
      : undefined,
    selection: bet.selection
      ? { id: bet.selection, label: bet.selection }
      : undefined,
    ...currencyAmounts,
    odd: bet.odd,
    dateFinished: bet.dateFinished ? new Date(bet.dateFinished) : null,
    profits: bet.profits,
    notes: bet.notes,
    amounts: bet.currencyAmounts,
    totalAmount: bet.totalAmount,
    actionTypeApplied: undefined,
    isSavedInDatabase: true,
  } as BetModel;
};
