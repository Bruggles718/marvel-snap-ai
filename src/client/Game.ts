import { Column } from "./Column";
import { Move } from "./Move";
import { Player, cardList } from "./Player";

const combinations = (arr, min = 1, max) => {
    const combination = (arr, depth) => {
      if (depth === 1) {
        return arr;
      } else {
        const result = combination(arr, depth - 1).flatMap((currentArr) =>
          arr.map((currentItem) => [...currentArr, currentItem])
        );
        return arr.concat(result);
      }
    };
  
    return combination(arr, max).filter((val) => val.length >= min);
  };

  var permutations = function(values) {
    var result = [];
    permute(values, []);
    return result;
  };

  var permute = function(values, prefix) {
    let result = []
    if (values.length === 0) {
      result.push(prefix);
    } else {
      for (var i = 0; i < values.length; i++) {
        var newValues = values.slice();
        var value = newValues.splice(i, 1);
        permute(newValues, prefix.concat(value));
      }
    }
  };

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

    }

    public Copy() {
        let result: Game = new Game();
        result.player.deck = [...this.player.deck];
        result.player.energy = this.player.energy;
        result.player.hand = [...this.player.hand];

        result.AI.deck = [...this.player.deck];
        result.AI.energy = this.player.energy;
        result.AI.hand = [...this.player.hand];

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
        for (let idx in i_move) {
            let col = i_move.cardLocations[idx];
            this.columns[col].playerCards.push(this.player.hand[idx]);
            this.player.energy -= this.player.hand[idx].energy;
            cardsToRemoveFromPlayerHand.push(idx);
        }

        // AI does move
        let aiMove = i_AIMove;

        let cardsToRemoveFromAiHand = [];
        for (let idx in aiMove) {
            let col = aiMove.cardLocations[idx];
            this.columns[col].AICards.push(this.AI.hand[idx]);
            this.AI.energy -= this.AI.hand[idx].energy;
            cardsToRemoveFromAiHand.push(idx);
        }

        // do column abilities

        for (let cardIdx of cardsToRemoveFromPlayerHand) {
            this.abilities[this.player.hand[cardIdx].name](this);
        }

        for (let cardIdx of cardsToRemoveFromAiHand) {
            this.abilities[this.AI.hand[cardIdx].name](this);
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

    public AIMove(): Move {

        return new Move();
    }

    public GetValidPlayerMoves(): Array<[Move, Game]> {
        let allPossibleCards = [...cardList];
        let cardsNotPlayed = [];
        for (let possibleCard of allPossibleCards) {
            for (let column of this.columns) {
                if (column.playerCards.indexOf(possibleCard) < 0) {
                    cardsNotPlayed.push(possibleCard);
                }
            }
        }
        let copiedBoard = this.Copy();
        let handLength = copiedBoard.player.hand.length;
        // cardsNotPlayed.length ^ handLength
        let possibleHands = combinations(cardsNotPlayed, handLength, handLength);

        let result = [];

        // copy game for each possible hand
        // calculate all possible moves for each possible hand
        // return array of tuples
        for (let i = 0; i < possibleHands.length; i++) {
            let hand = possibleHands[i];
            let game = this.Copy();

            let energy = game.round;
            // get every permutation of hand

            let allHandPermutations = permutations(hand);
            
            // for every permutation
            // for each card
            // go through each column
            // see if less than 4 cards in column
            // see if have enough energy
            // if have enough, play card there
            let allColumnPermutations = permutations([0, 1, 2]);

            for (let j = 0; j < allHandPermutations.length; j++) {
                let handPermutation = allHandPermutations[j];

                let energyThisHand = energy;

                for (let k = 0; k < handPermutation.length; k++) {
                    let card = handPermutation[k];

                    for (let l = 0; l < allColumnPermutations.length; l++) {
                        let columnPermutation = allColumnPermutations[l];

                        let move = new Move();

                        for (let m = 0; m < columnPermutation.length; m++) {
                            let columnNum = columnPermutation[m];
                            let column = game.columns[columnNum];

                            let cardsPlayedInColumn = {};

                            for (let idx in move.cardLocations) {
                                cardsPlayedInColumn[move.cardLocations[idx]] += 1;
                            }

                            // wrong - also need to check what has been played in a column
                            if (column.playerCards.length < 4 && energyThisHand - card.energy >= 0) {
                                move.cardLocations[k] = columnNum;
                                energyThisHand -= card.energy;
                            }
                        }
                    }
                }


            }
            
        }
        
        
        return [];
    }

    public GetValidAIMoves(): Array<Move> {
        return [];
    }

    public Minimax(i_game: Game, i_depth: number, i_alpha: number, i_beta: number, i_maximizingPlayer: boolean) {

    }
}