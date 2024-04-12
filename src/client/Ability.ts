import { Game } from "./Game";
import { getRandomInt } from "./Player";

export class Ability {
    public apply(i_game: Game) {}
}

export class IronheartAbility extends Ability {
    public pickedPlayerCards: boolean = false;
    public pickedAICards: boolean = false;

    public apply(i_game: Game) {
        let playerCardsToPickFrom = [];
        let doPlayerIronheart = false;
        let aiCardsToPickFrom = [];
        let doAiIronheart = false;
        for (let column of i_game.columns) {
            for (let card of column.playerCards) {
                if (card.name === "Ironheart") {
                    doPlayerIronheart = true;
                } else {
                    playerCardsToPickFrom.push(card);
                }
            }

            for (let card of column.AICards) {
                if (card.name === "Ironheart") {
                    doAiIronheart = true;
                } else {
                    aiCardsToPickFrom.push(card);
                }
            }
        }
        if (!this.pickedPlayerCards) {
            let numCardsToPick = playerCardsToPickFrom.length;
            for (let i = 0; i < Math.min(3, numCardsToPick); i++) {
                let idx = getRandomInt(playerCardsToPickFrom.length);
                playerCardsToPickFrom[idx].power += 2;
                playerCardsToPickFrom.splice(idx, 1);
            }
            this.pickedPlayerCards = true;
        }

        if (!this.pickedAICards) {
            let numCardsToPick = aiCardsToPickFrom.length;
            for (let i = 0; i < Math.min(3, numCardsToPick); i++) {
                let idx = getRandomInt(aiCardsToPickFrom.length);
                aiCardsToPickFrom[idx].power += 2;
                aiCardsToPickFrom.splice(idx, 1);
            }
            this.pickedAICards = true;
        }
    }
}

export class AntManAbility extends Ability {
    public playerAbilityDone = false;
    public aiAbliityDone = false;

    public apply(i_game: Game) {
        for (let column of i_game.columns) {
            for (let card of column.playerCards) {
                if (card.name === "Ant Man" && !this.playerAbilityDone) {
                    if (column.playerCards.length >= 4) {
                        card.power += 4;
                        this.playerAbilityDone = true;
                    }
                }
            }

            for (let card of column.AICards) {
                if (card.name === "Ant Man" && !this.aiAbliityDone) {
                    if (column.AICards.length >= 4) {
                        card.power += 4;
                        this.aiAbliityDone = true;
                    }
                }
            }
        }
    }
}