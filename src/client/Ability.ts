import { Game } from "./Game";
import { getRandomInt } from "./Player";

export class Ability {
    public apply(i_game: Game) {}
}

export class IronheartAbility extends Ability {
    public pickedPlayerCards: boolean = false;
    public pickedAICards: boolean = false;

    public apply(i_game: Game) {
        if (!this.pickedAICards) {
            for (let column of i_game.columns) {
                for (let card of column.AICards) {
                    if (card.name === "Ironheart") {
                        let colsToPickFrom = [];
                        let numOfCardsToPick = 0;
                        for (let i = 0; i < 3; i++) {
                            if (i_game.columns[i].AICards.length > 0) {
                                colsToPickFrom.push(i);
                                // console.log("add ai column " + i);
                                numOfCardsToPick = Math.min(3, numOfCardsToPick + i_game.columns[i].AICards.length);
                            }
                        } 

                        for (let i = 0; i < numOfCardsToPick; i++) {

                            let colIdx = getRandomInt(colsToPickFrom.length);
                            let cardIdx = getRandomInt(i_game.columns[colsToPickFrom[colIdx]].AICards.length);
                            i_game.columns[colIdx].AICards[cardIdx].power + 2;
                        }
                        this.pickedAICards = true;
                    }
                }
            }
            if (!this.pickedPlayerCards) {
                for (let column of i_game.columns) {
                    for (let card of column.playerCards) {
                        if (card.name === "Ironheart") {
                            let colsToPickFrom = [];
                            let numOfCardsToPick = 0;
                            for (let i = 0; i < 3; i++) {
                                if (i_game.columns[i].playerCards.length > 0) {
                                    colsToPickFrom.push(i);
                                    // console.log("add player column " + i);
                                    numOfCardsToPick = Math.min(3, numOfCardsToPick + i_game.columns[i].playerCards.length);
                                }
                            } 
                
                            for (let i = 0; i < 3; i++) {
                                let colIdx = getRandomInt(3);
                                let cardIdx = getRandomInt(i_game.columns[colIdx].playerCards.length);
                                i_game.columns[colIdx].playerCards[cardIdx].power + 2;
                            }
                            this.pickedPlayerCards = true;
                        }
                    }
                }
            }
        }
    }
}

export class AntManAbility extends Ability {
    public apply(i_game: Game) {
        let newPower = 5;

        for (let column of i_game.columns) {
            for (let card of column.playerCards) {
                if (card.name === "Ant Man") {
                    if (column.playerCards.length >= 4) {
                        card.power = newPower;
                    }
                }
            }

            for (let card of column.AICards) {
                if (card.name === "Ant Man") {
                    if (column.AICards.length >= 4) {
                        card.power = newPower;
                    }
                }
            }
        }
    }
}