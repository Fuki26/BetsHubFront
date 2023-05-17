import axios from "axios";
import { Bet, Counteragent } from "../database-models";
import { BetModel } from "../models";

const domain = 'http://213.91.236.205:5000';

const getPendingBets = async (): Promise<Array<Bet> | undefined> => {
    try {
        const getBetsResult = await axios.get(`${domain}/GetAllBets?StartIndex=0&Count=2&BetStatus=0`);
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
        if(bet.id < 0) {
            return;
        }

        if(!bet.totalAmount || bet.totalAmount <= 0) {
            return;
        }

        if(!bet.counteragentId) {
            return;
        }

        if(!bet.dateFinished || !bet.dateStaked) {
            return;
        }

        if(!bet.odd || bet.odd <= 0) {
            return;
        }
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
}

const getSports = async () => {
    try {

    } catch(e) {
        console.log(JSON.stringify(e));
    }
}

const getTournaments = async () => {
    try {

    } catch(e) {
        console.log(JSON.stringify(e));
    }
}

const getMarkets = async () => {
    try {

    } catch(e) {
        console.log(JSON.stringify(e));
    }
}

const getCounteragentSelections = async () => {
    try {

    } catch(e) {
        console.log(JSON.stringify(e));
    }
}