import { Column } from "./Column";
import { Move } from "./Move";
import { Player, cardList, getRandomInt } from "./Player";
import { permutations, range } from "itertools"
import combinations from "combinations"
import { Ability, AntManAbility, IronheartAbility } from "./Ability";

// const combinations = (arr, min = 1, max) => {
//     const combination = (arr, depth) => {
//       if (depth === 1) {
//         console.log("arr terminal: " + JSON.stringify(arr));
//         return arr;
//       } else {
//         const result = combination(arr, depth - 1).flatMap((currentArr) =>
//           arr.map((currentItem) => [...currentArr, currentItem])
//         );
//         console.log("result" + JSON.stringify(result));
//         console.log("arr" + JSON.stringify(arr));
//         return [...arr, ...result];
//       }
//     };
  
//     return combination(arr, max).filter((val) => val.length >= min);
//   };

//   var permutations = function(values) {
//     var result = [];
//     permute(values, []);
//     return result;
//   };

//   var permute = function(values, prefix) {
//     let result = []
//     if (values.length === 0) {
//       result.push(prefix);
//     } else {
//       for (var i = 0; i < values.length; i++) {
//         var newValues = values.slice();
//         var value = newValues.splice(i, 1);
//         permute(newValues, prefix.concat(value));
//       }
//     }
//   };

export const validPlayerMovesPerGame = {};
export const validAIMovesPerGame = {};

export const hashToGame = {};

export const scoreKeep = {};

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
    }

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

    public StartTurn() {
        this.player.energy = this.round;
        this.AI.energy = this.round;
    }

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

    public MakeMove(i_move: Move, i_AIMove: Move) {
        
        this.ApplySingleMove(i_move, true);
        this.ApplySingleMove(i_AIMove, false);
        // AI does move
        // do column abilities

        this.round++;
        this.player.energy = this.round;
        this.AI.energy = this.round;
        this.player.drawNewCard();
        this.AI.drawNewCard();
    }

    public SwapPlayers() {
        let copiedGame = this.Copy();

        this.player = copiedGame.AI;
        this.AI = copiedGame.player;
        for (let i = 0; i < this.columns.length; i++) {
            this.columns[i].playerCards = copiedGame.columns[i].AICards;
            this.columns[i].AICards = copiedGame.columns[i].playerCards;
        }
    }

    public AIMove(i_depth: number): Move {
        // let validAIMoves = this.GetValidAIMoves();
        // let idx = getRandomInt(validAIMoves.length);
        // return validAIMoves[idx];
        return this.Minimax(this.Copy(), i_depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true)[0];
    }

    public GetValidPlayerMoves(): Array<[Move, Game]> {
        if (validPlayerMovesPerGame[this.ToHash()]) {
            //console.log("found player moves");
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

        //console.log(cardsNotPlayed);

        let copiedBoard = this.Copy();
        let handLength = copiedBoard.player.hand.length;
        // cardsNotPlayed.length ^ handLength
        let possibleHands = combinations(cardsNotPlayed, handLength, handLength);

        //console.log(possibleHands);

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

    public GetValidAIMoves(): Array<Move> {
        if (validAIMovesPerGame[this.ToHash()]) {
            //console.log("found ai moves");
            //console.log(validAIMovesPerGame);
            // if (hashToGame[this.ToHash()]) {
            //     console.log("game found: ");
            //     console.log(hashToGame[this.ToHash()]);
            //     console.log("this game: ");
            //     console.log(this);
            // }
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

        // console.log("grouped perms: ");
        // console.log(groupedPerms);

        
        
        let groupedHandCombos = []
        for (let j = 0; j < handRange.length; j++) {
            groupedHandCombos.push([]);
        }
        let handCombos = combinations(handRange, 1, handRange.length);
        // console.log("hand combos: ");
        // console.log(handCombos);
        for (let arr of handCombos) {
            if (arr.length === 0) continue;
            groupedHandCombos[arr.length-1].push(arr);
        }

        // console.log("grouped hand combos: ");
        // console.log(groupedHandCombos);

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

        // console.log("All potential moves: ");
        // console.log(allPotentialMoves);


        for (let i = 0; i < allPotentialMoves.length; i++) {
            let move = allPotentialMoves[i];

            if (this.round - move.CalculateEnergyCost(this.AI.hand) >= 0) {
                result.push(move);
            } 
        }

        validAIMovesPerGame[this.ToHash()] = result;
        hashToGame[this.ToHash()] = this;

        return result;


        // let game = this.Copy();
        // for (let i = 0; i < game.AI.hand.length; i++) {
        //     for (let j = 0; j < game.columns.length; j++) {
        //         if (game.columns[j].AICards.length < 4) {
        //             let move = new Move();
        //             move.cardLocations[i] = j;
        //             result.push(move);
        //         }
        //     }
        // }
        // return result;
    }

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

    public Minimax(i_game: Game, i_depth: number, i_alpha: number, i_beta: number, i_maximizingPlayer: boolean): [Move, number] {
        //console.log("minimaxCalled. depth: " + i_depth);
        if (i_depth === 0) {
            //console.log("round number: " + i_game.round);
            return [undefined, i_game.ScorePosition()];
        }

        if (scoreKeep[i_game.ToHash()]) {
            return scoreKeep[i_game.ToHash()];
        }

        let alpha = i_alpha;
        let beta = i_beta;

        //console.log("got here2");

        if (i_maximizingPlayer) {
            let value = Number.NEGATIVE_INFINITY;
            let move = new Move();
            let validAIMoves = i_game.GetValidAIMoves();

            for (let validMove of validAIMoves) {
                //console.log("processed move "+ i);
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
                //console.log("Valid player moves: " + validPlayerMoves.length);
            }

            scoreKeep[i_game.ToHash()] = [move, value];

            return [move, value];
        } else {
            let value = Number.POSITIVE_INFINITY;
            let move = new Move();
            let validPlayerMoves = i_game.GetValidPlayerMoves();

            for (let validPlayerMove of validPlayerMoves) {
                //console.log("processed move "+ i);
                let g_copy = validPlayerMove[1].Copy();
                g_copy.ApplySingleMove(validPlayerMove[0], true);
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
                //console.log("Valid player moves: " + validPlayerMoves.length);
            }
            scoreKeep[i_game.ToHash()] = [move, value];

            return [move, value];
        }
        

        let g_copy = i_game.Copy();
        let validPlayerMoves = g_copy.GetValidPlayerMoves();
        for (let validPlayerMove of validPlayerMoves) {
            
            //console.log("processed inner move "+ j);
           
        }
        //console.log("validAIMoves: " + validAIMoves.length);
        let i = 0;
        
        // else {
        //     //console.log("got here3");
        //     let value = Number.POSITIVE_INFINITY;
        //     let move = new Move();

        //     let validPlayerMoves = i_game.GetValidPlayerMoves();
        //     //console.log(validPlayerMoves.length);
        //     for (let validMove of validPlayerMoves) {
        //         let g_copy = validMove[1].Copy();
        //         let opponentMove = i_otherMove;
        //         g_copy.MakeMove(validMove[0], opponentMove);
        //         let new_score = this.Minimax(g_copy.Copy(), i_depth - 1, alpha, beta, true, validMove[0])[1];

        //         if (new_score < value) {
        //             value = new_score;
        //             move = validMove[0];
        //         }

        //         beta = Math.min(beta, value);

        //         if (alpha >= beta) {
        //             break;
        //         }
        //     }

        //     return [move, value];
        // }
    }
}