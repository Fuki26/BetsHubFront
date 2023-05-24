import axios from "axios";
import { Bet, Counteragent } from "../database-models";
import { BetModel } from "../models";

const domain = 'http://213.91.236.205:5000';

const getPendingBets = async (): Promise<Array<Bet> | undefined> => {
    try {
        const getBetsResult = await axios.get(`${domain}/GetAllBets?StartIndex=0&Count=1&BetStatus=0`);
        return getBetsResult.data;
    } catch(e) {
        console.log(JSON.stringify(e));
    }
}

const getCompletedBets = async (): Promise<Array<Bet> | undefined> => {
    try {
        const getBetsResult = await axios.get(`${domain}/GetAllBets?StartIndex=0&Count=2&BetStatus=1`);
        return getBetsResult.data;
    } catch(e) {
        console.log(JSON.stringify(e));
    }
}

const upsertBet = async (bet: BetModel) => {
    try {
        const upsertBetResult = await axios.post(`${domain}/UpsertBets`, {
            Id: bet.id,
            BetStatus: bet.betStatus,
            Stake: bet.stake ? bet.stake : 0,
            CounteragentId: bet.counteragentId,
            Sport: bet.sport ? bet.sport : '',
            LiveStatus: bet.liveStatus,
            PSLimit: bet.psLimit ? bet.psLimit : 0,
            Market: bet.market ? bet.market : '',
            Tournament: bet.tournament ? bet.tournament : '',
            Selection: bet.selection ? bet.selection : '',
            AmountBGN: bet.amountBGN ? bet.amountBGN : 0,
            AmountEUR: bet.amountEUR ? bet.amountEUR : 0,
            AmountUSD: bet.amountUSD ? bet.amountUSD : 0,
            AmountGBP: bet.amountGBP ? bet.amountGBP : 0,
            Odd: bet.odd ? bet.odd : 0,
            DateFinished: bet.dateFinished ? bet.dateFinished.toString() : null,
            DateStaked: bet.dateStaked ? bet.dateStaked.toString() : null,
            Profits: bet.profits ? bet.profits : 0,
            Notes: bet.notes ? bet.notes : '',
        });

        const debug = -1;
    } catch(e) {
        console.log(JSON.stringify(e));
    }
}

const getCounteragents = async (): Promise<Array<Counteragent> | undefined> => {
    try {
        const getCountaagentsResult = await axios.get(`${domain}/GetAllCounteragents`);
        return getCountaagentsResult.data;
    } catch(e) {
        console.log(JSON.stringify(e));
    }
};

const getSports = async (): Promise<Array<string> | undefined> => {
    try {
        const getCountaagentsResult = await axios.get(`${domain}/GetAllSports`);
        return getCountaagentsResult.data;
    } catch(e) {
        console.log(JSON.stringify(e));
    }
};

const getTournaments = async () => {
    try {
        const getCountaagentsResult = await axios.get(`${domain}/GetAllTournaments`);
        return getCountaagentsResult.data;
    } catch(e) {
        console.log(JSON.stringify(e));
    }
};

const getMarkets = async () => {
    try {
        const getCountaagentsResult = await axios.get(`${domain}/GetAllMarkets`);
        return getCountaagentsResult.data;
    } catch(e) {
        console.log(JSON.stringify(e));
    }
}

const getSelections = async () => {
    try {
        const getCountaagentsResult = await axios.get(`${domain}/GetAllSelections`);
        return getCountaagentsResult.data;
    } catch(e) {
        console.log(JSON.stringify(e));
    }
}

const deleteBet = async (props: { id: number; }) => {
    try {
        const { id, } = props;
        const deleteBetResult = await axios.delete(`${domain}/DeleteBet`, {
            data: {
                id,
            },
        });

        return deleteBetResult.data;
    } catch(e) {
        console.log(JSON.stringify(e));
    }
}

export {
    getPendingBets,
    getCompletedBets,
    upsertBet,
    getCounteragents,
    getSports,
    getTournaments,
    getMarkets,
    getSelections,
    deleteBet,
};