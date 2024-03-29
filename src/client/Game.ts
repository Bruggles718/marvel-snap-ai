import { Column } from "./Column";
import { Move } from "./Move";
import { Player } from "./Player";

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

    public StartTurn() {
        this.player.energy = this.round;
        this.AI.energy = this.round;
    }

    public MakeMove(i_move: Move) {
        let cardsToRemoveFromPlayerHand = [];
        for (let idx in i_move) {
            let col = i_move.cardLocations[idx];
            this.columns[col].playerCards.push(this.player.hand[idx]);
            this.player.energy -= this.player.hand[idx].energy;
            cardsToRemoveFromPlayerHand.push(idx);
        }

        // AI does move
        let aiMove = this.AIMove();

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
}