import { Column } from "./Column";
import { Move } from "./Move";
import { Player, cardList, getRandomInt } from "./Player";
import { permutations, range } from "itertools"
import combinations from "combinations"

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

export class Game {
    public abilities: {[index: string]: (i_game: Game) => any} = {};
    
    public player: Player = new Player();
    public AI: Player = new Player();

    public round: number = 1;

    public columns: Array<Column> = [
        new Column(),
        new Column(),
        new Column()
    ];

    constructor() {
        this.abilities["wakanda"] = () => {
            console.log("doing wakanda");
        };
    }

    public Copy() {
        let result: Game = new Game();
        result.player.deck = [...this.player.deck];
        result.player.energy = this.player.energy;
        result.player.hand = [...this.player.hand];

        result.AI.deck = [...this.AI.deck];
        result.AI.energy = this.AI.energy;
        result.AI.hand = [...this.AI.hand];

        result.columns = []

        for (let i = 0; i < this.columns.length; i++) {
            let col = new Column();
            let thisCol = this.columns[i];
            col.AICards = [...thisCol.AICards];
            col.ability = thisCol.ability;
            col.playerCards = [...thisCol.playerCards];
            col.revealed = thisCol.revealed;
            result.columns.push(col);
        }
        
        result.round = this.round;
        return result;
    }

    public StartTurn() {
        this.player.energy = this.round;
        this.AI.energy = this.round;
    }

    public MakeMove(i_move: Move, i_AIMove: Move) {
        let cardsToRemoveFromPlayerHand = [];
        for (let idx in i_move.cardLocations) {
            let col = i_move.cardLocations[idx];
            this.columns[col].playerCards.push(this.player.hand[idx]);
            this.player.energy -= this.player.hand[idx].energy;
            cardsToRemoveFromPlayerHand.push(parseInt(idx));
        }

        // AI does move
        let aiMove = i_AIMove;

        let cardsToRemoveFromAiHand = [];
        for (let idx in aiMove.cardLocations) {
            let col = aiMove.cardLocations[idx];
            this.columns[col].AICards.push(this.AI.hand[idx]);
            this.AI.energy -= this.AI.hand[idx].energy;
            cardsToRemoveFromAiHand.push(parseInt(idx));
        }

        // do column abilities

        for (let cardIdx of cardsToRemoveFromPlayerHand) {
            if (this.abilities[this.player.hand[cardIdx].name]) {
                this.abilities[this.player.hand[cardIdx].name](this);
            }
        }

        for (let cardIdx of cardsToRemoveFromAiHand) {
            if (this.abilities[this.AI.hand[cardIdx].name]) {
                this.abilities[this.AI.hand[cardIdx].name](this);
            }
        }

        let newHand = [];
        for (let i = 0; i < this.player.hand.length; i++) {
            if (cardsToRemoveFromPlayerHand.indexOf(i) === -1) {
                newHand.push(this.player.hand[i]);
            }
        }

        this.player.hand = [...newHand];

        let newAIHand = [];
        for (let i = 0; i < this.AI.hand.length; i++) {
            if (cardsToRemoveFromAiHand.indexOf(i) === -1) {
                newAIHand.push(this.AI.hand[i]);
            }
        }
        this.AI.hand = [...newAIHand];
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

    public AIMove(): Move {
        let moves = this.GetValidAIMoves();
        let idx = getRandomInt(moves.length);
        return moves[idx];
    }

    public GetValidPlayerMoves(): Array<[Move, Game]> {
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

        console.log(possibleHands);

        let result = [];

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

        return result;
    }

    public GetValidAIMoves(): Array<Move> {
        let result = [];

        // get all possible combinations of cards played into columns
        // remove all combinations that have invalid energy counts

        let possibleColumns = [];

        for (let i = 0; i < this.columns.length; i++) {
            let spacesRemaining = 4 - this.columns[i].AICards.length;

            for (let j = 0; j < spacesRemaining; j++) {
                possibleColumns.push(i);
            }
        }

        let permDict = {};
        let groupedPerms = [];
        for (let j = 0; j < this.AI.hand.length; j++) {
            groupedPerms.push([]);
        }
        for (let j = 1; j <= this.AI.hand.length; j++) {
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

        //console.log(groupedPerms);

        let handRange = [...Array(this.AI.hand.length).keys()];
        
        let groupedHandCombos = []
        for (let j = 0; j < this.AI.hand.length; j++) {
            groupedHandCombos.push([]);
        }
        let handCombos = combinations(handRange, 1, this.AI.hand.length);
        for (let arr of handCombos) {
            groupedHandCombos[arr.length-1].push(arr);
        }
        //console.log(groupedHandCombos);

        let allPotentialMoves = [];

        for (let j = 0; j < this.AI.hand.length; j++) {
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
        
    }

    public Minimax(i_game: Game, i_depth: number, i_alpha: number, i_beta: number, i_maximizingPlayer: boolean) {
        if (i_depth === 0) {

        }
    }
}