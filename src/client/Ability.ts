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
        if (!this.pickedPlayerCards && doPlayerIronheart) {
            let numCardsToPick = playerCardsToPickFrom.length;
            for (let i = 0; i < Math.min(3, numCardsToPick); i++) {
                let idx = getRandomInt(playerCardsToPickFrom.length);
                playerCardsToPickFrom[idx].power += 2;
                playerCardsToPickFrom.splice(idx, 1);
            }
            this.pickedPlayerCards = true;
        }

        if (!this.pickedAICards && doAiIronheart) {
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

export class BlackPantherAbility extends Ability {
    public aiAbliityDone = false;
    public playerAbilityDone = false;

    public apply(i_game: Game) {
        for (let column of i_game.columns) {
            if (!this.aiAbliityDone) {
                for (let card of column.AICards) {
                    if (card.name === "Black Panther") {
                        card.power *= 2;
                        this.aiAbliityDone = true;
                    }
                }
            }
            

            if (!this.playerAbilityDone) {
                for (let card of column.playerCards) {
                    if (card.name === "Black Panther") {
                        card.power *= 2;
                        this.aiAbliityDone = true;
                    }
                }
            }
        }
    }
}



export class MedusaAbility extends Ability {
    public aiAbliityDone = false;
    public playerAbilityDone = false;

    public apply(i_game: Game) {
        const middle = Math.floor(i_game.columns.length / 2);
        const middleColumn = i_game.columns[middle];
        if (!this.aiAbliityDone) {
            for (let card of middleColumn.AICards) {
                if (card.name === "Medusa") {
                    card.power += 3;
                    this.aiAbliityDone = true;
                }
            }
        }

        if (!this.playerAbilityDone) {
            for (let card of middleColumn.playerCards) {
                if (card.name === "Medusa") {
                    card.power += 3;
                    this.playerAbilityDone = true;
                }
            }
        }
    }
}

/*
export class KlawAbility extends Ability {
    public aiAbliityDone = false;
    public playerAbilityDone = false;

    public apply(i_game: Game) {
        const columns = i_game.columns;
        for (let i = 0 ; i < i_game.columns.length - 1; i++) {
            if (!this.aiAbliityDone) {
                for (let card of columns[i].AICards) {
                    if (card.name === "Klaw") {
                        columns[i + 1];
                        this.aiAbliityDone = true;
                    }
                }
            }
        }
        for (let column of i_game.columns) {
            if (!this.aiAbliityDone) {
                for (let card of column.AICards) {
                    if (card.name === "Black Panther") {
                        card.power *= 2;
                        this.aiAbliityDone = true;
                    }
                }
            }
            

            if (!this.playerAbilityDone) {
                for (let card of column.playerCards) {
                    if (card.name === "Black Panther") {
                        card.power *= 2;
                        this.aiAbliityDone = true;
                    }
                }
            }
        }
    }
}*/


export class DazzlerAbility extends Ability {
    public aiColumnAdded: {[index: number]: boolean} = {0 : false, 1 : false, 2 : false};
    public playerColumnAdded: {[index: number]: boolean} = {0 : false, 1 : false, 2 : false};

    public apply(i_game: Game) {

        for (let column of i_game.columns) {
            for (let card of column.AICards) {
                if (card.name === "Dazzler") {
                    let aiValue = 0;
                    for (let i = 0 ; i < i_game.columns.length; i++) {
                        const column = i_game.columns[i];
                        if (column.AICards.length === 4 && !this.aiColumnAdded[i]) {
                            this.aiColumnAdded[i] = true;
                            aiValue += 2;
                        }
                    }
                    card.power += aiValue;
                }
            }
            for (let card of column.playerCards) {
                if (card.name === "Dazzler") {
                    let playerValue = 0;
                    for (let i = 0 ; i < i_game.columns.length; i++) {
                        const column = i_game.columns[i];
                        if (column.playerCards.length === 4 && !this.playerColumnAdded[i]) {
                            this.playerColumnAdded[i] = true;
                            playerValue += 2;
                        }
                    }
                    card.power += playerValue;
                }
            }
        }
         
    }
}

export class GwenpoolAbility extends Ability {
    public playerAbilityDone = false;
    public aiAbliityDone = false;

    public apply(i_game: Game) {
        for (let column of i_game.columns) {
            for (let card of column.playerCards) {
                if (card.name === "Gwenpool" && !this.playerAbilityDone) {
                        card.power *= 2;
                        this.playerAbilityDone = true;       
                }
            }

            for (let card of column.AICards) {
                if (card.name === "Gwenpool" && !this.aiAbliityDone) {
                        card.power *= 2;
                        this.aiAbliityDone = true;     
                }
            }
        }
    }
}


export class CaptainAmericaAbility extends Ability {
    public playerAbilityDone = false;
    public aiAbliityDone = false;
    public aiCardsUpdated: string[] = ["Captain America"];
    public playersCardUpdated: string[] = ["Captain America"];


    public apply(i_game: Game) {

        for (let column of i_game.columns) {
            for (let card of column.playerCards) {
                if (card.name === "Captain America") {
                    for (let card2 of column.playerCards) {
                        console.log(this.playersCardUpdated);
                        if (this.playersCardUpdated.indexOf(card2.name) == -1) {
                            card2.power += 1;
                            this.playersCardUpdated.push(card2.name);
                        }
                    }
                }
            }

            for (let card of column.AICards) {
                if (card.name === "Captain America" && !this.aiAbliityDone) {
                    for (let card2 of column.AICards) {
                        if (this.aiCardsUpdated.indexOf(card2.name) == -1) {
                            card2.power += 1;
                            this.aiCardsUpdated.push(card2.name);
                        }
                    }
                    
                }
            }
        }
    }
}

export class NamorAbility extends Ability {
    public addedPlayer = false;
    public removedPlayer = false;
    public addedAI = false;
    public removedAI = false;

    public apply(i_game: Game) {
        for (let column of i_game.columns) {
            for (let card of column.playerCards) {
                if (card.name === "Namor") {
                    if (column.playerCards.length == 1) {
                        if (!this.addedPlayer) {
                            card.power += 5;
                            this.addedPlayer = true;
                        }
                    } else {
                        if (!this.removedPlayer) {
                            card.power -= 5;
                            this.removedPlayer = true;
                        }
                    }
                }
            }

            for (let card of column.AICards) {
                if (card.name === "Namor") {
                    if (column.AICards.length == 1) {
                        if (!this.addedAI) {
                            card.power += 5;
                            this.addedAI = true;
                        }
                    } else {
                        if (!this.removedAI) {
                            card.power -= 5;
                            this.removedAI = true;
                        }
                    }
                }
            }
        }
    }
}

