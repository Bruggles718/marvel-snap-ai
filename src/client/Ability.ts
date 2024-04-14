import { Game } from "./Game";
import { getRandomInt } from "./Player";

/**
 * Ability class that all abilities will extend from
 */
export class Ability {
    /**
     * All abilities will have this apply method so that every turn we cann
     * apply each active ability
     * @param i_game the game to apply the ability to
     */
    public apply(i_game: Game) {}
}

/**
 * The ability for the IronHeart card
 * IronHeart will add 2 power to 3 random cards of the owner
 */
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

/**
 * The ability for the AntMan card
 * If the column is full, AntMan will add 4 power to itself on reveal
 */
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

/**
 * The ability for the Black Panther card
 * Black Panther will double the power of itself once on reveal
 */
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
                        this.playerAbilityDone = true;
                    }
                }
            }
        }
    }
}

/**
 * The ability for the Medusa card
 * Medusa will add 3 power to itself if it is in the middle column on reveal
 */
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

/**
 * The ability for the Dazzler card
 * The Dazzler will add 2 power to itself for each full column
 */
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

/**
 * The ability for the Gwenpool card
 * Gwenpool will double the power of itself on reveal
 */
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

/**
 * The ability for the Captain America card
 * Captain America will add 1 power to all other cards in the column 
 */
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

/**
 * The ability for the Namor card
 * Namor will add 5 power to itself if it is the only card in the column
 */
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
                        if (!this.removedPlayer && this.addedPlayer) {
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
/**
 * The ability for the Stark Tower column
 * Stark Tower will add 2 power to all cards in the column after turn 5
 */
export class StarkTowerAbility extends Ability {
    public aiCardsUpdated: string[] = [];
    public playersCardUpdated: string[] = [];
    public columnToApply: number = 0;


    public apply(i_game: Game) {
        if (i_game.round > 5) {
            const column = i_game.columns[this.columnToApply];
            if (!column.revealed) return;
            for (let card of column.playerCards) {
                if (this.playersCardUpdated.indexOf(card.name) == -1) {
                    card.power += 2;
                    this.playersCardUpdated.push(card.name);
                }
            }                
            
            for (let card of column.AICards) {
                if (this.aiCardsUpdated.indexOf(card.name) == -1) {
                    card.power += 2;
                    this.aiCardsUpdated.push(card.name);
                }
            }
        }
    }

}

/**
 * The ability for the Xandar column
 * Xandar will add 1 power to all cards in the column
 */
export class XandarAbility extends Ability {
    public playerAbilityDone = false;
    public aiAbliityDone = false;
    public aiCardsUpdated: string[] = [];
    public playersCardUpdated: string[] = [];
    public columnToApply: number = 0;


    public apply(i_game: Game) {
        const column = i_game.columns[this.columnToApply];
        if (!column.revealed) return;
        
        for (let card of column.playerCards) {
            if (this.playersCardUpdated.indexOf(card.name) == -1) {
                card.power += 1;
                this.playersCardUpdated.push(card.name);
            }
        }

        for (let card of column.AICards) {
                if (this.aiCardsUpdated.indexOf(card.name) == -1) {
                    card.power += 1;
                    this.aiCardsUpdated.push(card.name);
                }
        }
    }

}

/**
 * The ability for the Atlantis column
 * Atlantis will add 5 power to the card in the column 
 * if it is the only card in the column
 */
export class AtlantisAbility extends Ability {
    public addedPlayer = false;
    public removedPlayer = false;
    public addedAI = false;
    public removedAI = false;
    public columnToApply: number = 0;

    public apply(i_game: Game) {
        const column = i_game.columns[this.columnToApply];
        if (!column.revealed) return;
        
        for (let card of column.playerCards) {
            if (column.playerCards.length == 1) {
                if (!this.addedPlayer) {
                    card.power += 5;
                    this.addedPlayer = true;
                }
            } else {
                if (!this.removedPlayer && this.addedPlayer) {
                    card.power -= 5;
                    this.removedPlayer = true;
                }
            }
                
        }

        for (let card of column.AICards) {
            if (column.AICards.length == 1) {
                if (!this.addedAI) {
                    card.power += 5;
                    this.addedAI = true;
                }
            } else {
                if (!this.removedAI && this.addedAI) {
                    card.power -= 5;
                    this.removedAI = true;
                }
            }    
        }
        
    }
}