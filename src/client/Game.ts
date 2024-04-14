import { Column } from "./Column";
import { Move } from "./Move";
import { Player, cardList, getRandomInt } from "./Player";
import { permutations, range } from "itertools"
import combinations from "combinations"
import { Ability, AntManAbility, IronheartAbility, BlackPantherAbility, MedusaAbility, DazzlerAbility, GwenpoolAbility, CaptainAmericaAbility, NamorAbility, StarkTowerAbility, XandarAbility, AtlantisAbility } from "./Ability";

// These 2 are a form of memoization
// so that we don't have to recalculate the same moves over and over
export const validPlayerMovesPerGame = {};
export const validAIMovesPerGame = {};

// Another form of memoization, so we can keep the scores of the games
export const scoreKeep = {};

/**
 * Represents a game of Marvel Snap
 * We have our list of abilities with the key being the name of it
 * We have our player and AI
 * We have our round number which starts at 1 and goes up to 6
 * And our energy will be the same as the round number
 * And we have our columns which are our left, middle, and right locations
 */
export class Game {
    public abilities: {[index: string]: Ability} = {};
    
    public player: Player = new Player();
    public AI: Player = new Player();

    public round: number = 1;

    public columns: Array<Column> = [
        new Column(),
        new Column(),
        new Column()
    ];

    constructor() {
        this.abilities["Ant Man"] = new AntManAbility();
        this.abilities["Ironheart"] = new IronheartAbility();
        this.abilities["Black Panther"] = new BlackPantherAbility();
        this.abilities["Medusa"] = new MedusaAbility();
        this.abilities["Dazzler"] = new DazzlerAbility();
        this.abilities["Gwenpool"] = new GwenpoolAbility();
        this.abilities["Captain America"] = new CaptainAmericaAbility();
        this.abilities["Namor"] = new NamorAbility();
        this.columns[0].ability = "Stark Tower"
        const starkTowerAbility = new StarkTowerAbility();
        starkTowerAbility.columnToApply = 0;
        this.abilities["Stark Tower"] = starkTowerAbility;

        this.columns[2].ability = "Xandar";
        const xandarAbility = new XandarAbility();
        xandarAbility.columnToApply = 2;
        this.abilities["Xandar"] = xandarAbility;

        this.columns[1].ability = "Atlantis";
        const atlantisAbility = new AtlantisAbility();
        atlantisAbility.columnToApply = 1;
        this.abilities["Atlantis"] = atlantisAbility;
    }

    /**
     * Create a custom hash code for this current game
     * @returns hash for this game
     */
    public ToHash() {
        let result = "";
        const iDefault = 2;
        let i = iDefault;
        for (let card of this.player.hand) {
            result += card.ToHash();
            i++;
        }

        i = iDefault;
        for (let card of this.AI.hand) {
            result += card.ToHash();
            i++;
        }

        for (let column of this.columns) {
            result += column.ToHash();
        }

        result += this.round.toString();

        return result;
    }

    /**
     * Makes a copy of the current game
     * @returns a copy of this game
     */
    public Copy() {
        let result: Game = new Game();
        result.player = this.player.Copy();

        result.AI = this.AI.Copy();

        result.columns = []

        for (let i = 0; i < this.columns.length; i++) {
            let col = this.columns[i];
            result.columns.push(col.Copy());
        }
        
        result.round = this.round;
        return result;
    }

    /**
     * Start the turn by setting the energy of 
     * the player and AI to the round number
     */
    public StartTurn() {
        this.player.energy = this.round;
        this.AI.energy = this.round;
    }

    /**
     * Used for minimax but this will apply a single move by either
     * the player or the AI (which is determined by i_player)
     * @param i_move The move to apply
     * @param i_player true if the player and false if the AI
     */
    public ApplySingleMove(i_move: Move, i_player: boolean) {
        if (i_player) {
            let cardsToRemoveFromPlayerHand = [];
            if (i_move) {
                for (let idx in i_move.cardLocations) {
                    let col = i_move.cardLocations[idx];
                    this.columns[col].playerCards.push(this.player.hand[idx].Copy());
                    try {
                        this.player.energy -= this.player.hand[parseInt(idx)].energy;
                    } catch (e) {
                        console.error("Hand idx " + idx + "was invalid!");
                        console.error(this.player.hand);
                    }
                    
                    cardsToRemoveFromPlayerHand.push(parseInt(idx));
                }

                for (let column of this.columns) {
                    for (let card of column.playerCards) {
                        if (this.abilities[card.name]) {
                            this.abilities[card.name].apply(this);
                        }
                    }
                }

                let newHand = [];
                for (let i = 0; i < this.player.hand.length; i++) {
                    if (cardsToRemoveFromPlayerHand.indexOf(i) === -1) {
                        newHand.push(this.player.hand[i]);
                    }
                }

                this.player.hand = [...newHand];
            }
        } else {
            let aiMove = i_move;
        
            let cardsToRemoveFromAiHand = [];

            if (aiMove) {
                for (let idx in aiMove.cardLocations) {
                    let col = aiMove.cardLocations[idx];
                    this.columns[col].AICards.push(this.AI.hand[idx].Copy());
                    this.AI.energy -= this.AI.hand[idx].energy;
                    cardsToRemoveFromAiHand.push(parseInt(idx));
                }
            }

            for (let column of this.columns) {
                for (let card of column.AICards) {
                    if (this.abilities[card.name]) {
                        this.abilities[card.name].apply(this);
                    }
                }
            }

            let newAIHand = [];
            for (let i = 0; i < this.AI.hand.length; i++) {
                if (cardsToRemoveFromAiHand.indexOf(i) === -1) {
                    newAIHand.push(this.AI.hand[i]);
                }
            }
            this.AI.hand = [...newAIHand];
        }
    }

    /**
     * When we have both the player an ai move's we can apply
     * them to the game. Then we will reveal the columns and apply
     * both location abilities as well as card abilities. After every move
     * we will increment the round number and update the energy of the players
     * @param i_move the player's move
     * @param i_AIMove the ai's move
     */
    public MakeMove(i_move: Move, i_AIMove: Move) {
        
        this.ApplySingleMove(i_move, true);
        this.ApplySingleMove(i_AIMove, false);

        for (let column of this.columns) {
            if (!column.revealed) {
                column.revealed = true;
                break;
            }
        }


        for (let column of this.columns) {
            if (column.ability && this.abilities[column.ability]) {
                this.abilities[column.ability].apply(this);
            }
        }
        if (this.round === 6) {
            const overlay = document.getElementById("overlay");
            overlay.style.display = "block";
            let playerWins = 0;
            let aiWins = 0;
            let totalPlayerScore = 0;
            let totalAIScore = 0;
            for (let column of this.columns) {
                totalPlayerScore += column.GetPlayerValue();
                totalAIScore += column.GetAIValue();
                if (column.GetPlayerValue() > column.GetAIValue()) {
                    playerWins++;
                } else if (column.GetAIValue() > column.GetPlayerValue()) {
                    aiWins++;
                }
            }
            const gameOverMessage = document.getElementById("Game-Over-Message");
            if (playerWins > aiWins) {
                gameOverMessage.textContent = "You win!";
                gameOverMessage.classList.add("player-win");
            } else if (aiWins > playerWins) {
                gameOverMessage.textContent = "You Lose!";
                gameOverMessage.classList.add("ai-win");
            } else {
                if (totalPlayerScore > totalAIScore) {
                    gameOverMessage.textContent = "You win!";
                    gameOverMessage.classList.add("player-win");
                } else if (totalAIScore > totalPlayerScore) {
                    gameOverMessage.textContent = "You Lose!";
                    gameOverMessage.classList.add("ai-win");
                } else {
                    gameOverMessage.textContent = "Tie Game!";
                    gameOverMessage.classList.add("tie");
                }   
            }
            return;
        }
        this.round++;
        const turnCount = document.getElementById("End Turn");
        turnCount.textContent = "End Turn: " + this.round + "/6";
        this.player.energy = this.round;
        this.AI.energy = this.round;
        this.player.drawNewCard();
        this.AI.drawNewCard();
    }

    /**
     * For the game, swap the player and the AI representations
     */
    public SwapPlayers() {
        let copiedGame = this.Copy();

        this.player = copiedGame.AI;
        this.AI = copiedGame.player;
        for (let i = 0; i < this.columns.length; i++) {
            this.columns[i].playerCards = copiedGame.columns[i].AICards;
            this.columns[i].AICards = copiedGame.columns[i].playerCards;
        }
    }

    /**
     * Make a move for our ai using minimax
     * @param i_depth the depth of the minimax algorithm
     * @returns the chosen move
     */
    public AIMove(i_depth: number): Move {
        //let validAIMoves = this.GetValidAIMoves();
        //let idx = getRandomInt(validAIMoves.length);
        //return validAIMoves[idx];
        return this.Minimax(this.Copy(), i_depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true)[0];
    }

    /**
     * For minimax, we need to get all the valid moves for the player
     * @returns all the valid moves for the player for each game
     */
    public GetValidPlayerMoves(): Array<[Move, Game]> {
        if (validPlayerMovesPerGame[this.ToHash()]) {
            return validPlayerMovesPerGame[this.ToHash()];
        }

        // for every possible player hand
        // we make a game, and swap the player and ai
        // then call getvalidai moves
        // then, associate the moves, with the game
        let allPossibleCards = [...cardList];
        let cardsNotPlayed = [];
        let cardsPlayed = [];
        for (let column of this.columns) {
            cardsPlayed.push(...column.playerCards);
        }
        for (let possibleCard of allPossibleCards) {
            if (cardsPlayed.indexOf(possibleCard) < 0) {
                cardsNotPlayed.push(possibleCard);
            }
        }

        let copiedBoard = this.Copy();
        let handLength = copiedBoard.player.hand.length;
        // cardsNotPlayed.length ^ handLength
        let possibleHands = combinations(cardsNotPlayed, handLength, handLength);

        let result = [];
        result.push([new Move(), this.Copy()])

        for (let hand of possibleHands) {
            if (hand.length > handLength) continue;
            let copiedGame = this.Copy();
            copiedGame.SwapPlayers();
            copiedGame.player.hand = hand;
            let validMoves = copiedGame.GetValidAIMoves();
            let copiedGameResult = this.Copy();
            for (let move of validMoves) {
                result.push([move, copiedGameResult]);
            }
        }

        validPlayerMovesPerGame[this.ToHash()] = result;

        return result;
    }

    /**
     * Gets all the valid moves for the AI
     * @returns the valid moves for the AI
     */
    public GetValidAIMoves(): Array<Move> {
        if (validAIMovesPerGame[this.ToHash()]) {
            return validAIMovesPerGame[this.ToHash()];
        }

        let result = [];

        // get all possible combinations of cards played into columns
        // remove all combinations that have invalid energy counts

        let tempHandRange = [...Array(this.AI.hand.length).keys()];
        let handRange = [];

        for (let n of tempHandRange) {
            if (this.AI.hand[n].energy <= this.round) {
                handRange.push(n);
            }
        }

        let possibleColumns = [];

        for (let i = 0; i < this.columns.length; i++) {
            let spacesRemaining = 4 - this.columns[i].AICards.length;

            for (let j = 0; j < spacesRemaining; j++) {
                possibleColumns.push(i);
            }
        }

        let permDict = {};
        let groupedPerms = [];
        for (let j = 0; j < handRange.length; j++) {
            groupedPerms.push([]);
        }
        for (let j = 1; j <= handRange.length; j++) {
            for (let i of permutations(possibleColumns, j)) {
                let stringRepresentation = "";
                for (let digit of i) {
                    stringRepresentation += digit as string;
                }
                permDict[stringRepresentation] = i;
            }
        }

        for (let idx in permDict) {
            groupedPerms[idx.length-1].push(permDict[idx]);
        }

        
        
        let groupedHandCombos = []
        for (let j = 0; j < handRange.length; j++) {
            groupedHandCombos.push([]);
        }
        let handCombos = combinations(handRange, 1, handRange.length);
        for (let arr of handCombos) {
            if (arr.length === 0) continue;
            groupedHandCombos[arr.length-1].push(arr);
        }

        let allPotentialMoves = [];

        for (let j = 0; j < handRange.length; j++) {
            let possibleHands = groupedHandCombos[j];
            let possibleColumnOrders = groupedPerms[j];

            for (let k = 0; k < possibleColumnOrders.length; k++) {
                let columnOrder = possibleColumnOrders[k];
                for (let l = 0; l < possibleHands.length; l++) {
                    let currentHand = possibleHands[l];
                    let move = new Move();
                    for (let m = 0; m < currentHand.length; m++) {
                        move.cardLocations[currentHand[m]] = columnOrder[m];
                        allPotentialMoves.push(move);
                    }
                }
            }
        }


        for (let i = 0; i < allPotentialMoves.length; i++) {
            let move = allPotentialMoves[i];

            if (this.round - move.CalculateEnergyCost(this.AI.hand) >= 0) {
                result.push(move);
            } 
        }

        validAIMovesPerGame[this.ToHash()] = result;

        return result;
    }

    /**
     * Given a game, return the ai score's
     * based on the columns it is winning
     * @returns 
     */
    public ScorePosition() {
        let result = 0;
        let winningColumns = 0;
        let losingColumns = 0;
        for (let column of this.columns) {
            let valueToAdd = (column.GetAIValue() - column.GetPlayerValue());
            result += valueToAdd;
            if (valueToAdd > 0) {
                winningColumns++;
            } else if (valueToAdd < 0){
                losingColumns++;
            }
        }

        return winningColumns - losingColumns;
    }

    /**
     * Minimax algorithm to determine the best move using alpha beta prunning
     * @param i_game the game being processed 
     * @param i_depth the depth to calculate
     * @param i_alpha alpha value which is the best value so far for the AI
     * @param i_beta beta value which is the best value so far for the player
     * @param i_maximizingPlayer the player evaluated for, true for AI, false for player
     * @returns the move and its score
     */
    public Minimax(i_game: Game, i_depth: number, i_alpha: number, i_beta: number, i_maximizingPlayer: boolean): [Move, number] {
        if (i_depth === 0) {
            return [undefined, i_game.ScorePosition()];
        }

        if (scoreKeep[i_game.ToHash()]) {
            return scoreKeep[i_game.ToHash()];
        }

        let alpha = i_alpha;
        let beta = i_beta;

        if (i_maximizingPlayer) {
            let value = Number.NEGATIVE_INFINITY;
            let move = new Move();
            let validAIMoves = i_game.GetValidAIMoves();

            for (let validMove of validAIMoves) {
                let g_copy = i_game.Copy();
                g_copy.ApplySingleMove(validMove, false);
                let new_score = this.Minimax(g_copy.Copy(), i_depth - 1, alpha, beta, false)[1];
                if (new_score > value) {
                    value = new_score;
                    move = validMove;
                }

                alpha = Math.max(alpha, value);

                if (alpha >= beta) {
                    break;
                }
            }

            scoreKeep[i_game.ToHash()] = [move, value];

            return [move, value];
        } else {
            let value = Number.POSITIVE_INFINITY;
            let move = new Move();
            let validPlayerMoves = i_game.GetValidPlayerMoves();

            for (let validPlayerMove of validPlayerMoves) {
                let g_copy = validPlayerMove[1].Copy();
                g_copy.ApplySingleMove(validPlayerMove[0], true);
                for (let column of g_copy.columns) {
                    if (!column.revealed) {
                        column.revealed = true;
                        break;
                    }
                }
        
        
                for (let column of g_copy.columns) {
                    if (column.ability && g_copy.abilities[column.ability]) {
                        g_copy.abilities[column.ability].apply(g_copy);
                    }
                }
                g_copy.round++;
                g_copy.player.energy = g_copy.round;
                g_copy.AI.energy = g_copy.round;
                g_copy.player.drawNewCard();
                g_copy.AI.drawNewCard();
                let new_score = this.Minimax(g_copy.Copy(), i_depth - 1, alpha, beta, true)[1];
                if (new_score < value) {
                    value = new_score;
                    move = validPlayerMove[0];
                }

                beta = Math.min(beta, value);

                if (alpha >= beta) {
                    break;
                }
            }
            scoreKeep[i_game.ToHash()] = [move, value];

            return [move, value];
        }
    }
}