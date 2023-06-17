import { Bet } from "../database-models";
import { BetModel } from "../models";
import { BetStatus, LiveStatus, WinStatus } from "../models/enums";

export const betToBetModelMapper = (bet: Bet) => {
    return {
      id: bet.id,
      dateCreated: new Date(bet.dateCreated),
      betStatus: { id: bet.betStatus.toString(), label: BetStatus[bet.betStatus] },
      winStatus: { id: bet.winStatus.toString(), label: WinStatus[bet.winStatus] },
      stake: bet.stake,
      counterAgent: bet.counteragent
        ? { id: bet.counteragent.id.toString(), label: bet.counteragent.name, }
        : undefined,
      sport:	bet.sport
        ? { id: bet.sport, label: bet.sport, }
        : undefined,
      liveStatus:	{ id: bet.liveStatus.toString(), label: LiveStatus[bet.liveStatus] }, 
      psLimit: bet.psLimit,
      market: bet.market
        ? { id: bet.market, label: bet.market, }
        : undefined,
      tournament: bet.tournament
        ? { id: bet.tournament, label: bet.tournament, }
        : undefined,
      selection: bet.selection
        ? { id: bet.selection, label: bet.selection, }
        : undefined,
      amountBGN: bet.amountBGN,
      amountEUR: bet.amountEUR,
      amountUSD: bet.amountUSD,
      amountGBP: bet.amountGBP,
      odd: bet.odd,
      dateFinished: bet.dateFinished
        ? new Date(bet.dateFinished)
        : null,
      profits: bet.profits,
      notes: bet.notes,
  
      actionTypeApplied: undefined,
      isSavedInDatabase: true,
    } as BetModel;
  };