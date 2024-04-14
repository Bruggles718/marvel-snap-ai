import { Card } from "./Card"

/**
 * List of cards we've added in that can be played
 */
export const cardList = [
    new Card("Medusa", 2, 2),
    new Card("Hulk", 6, 12),
    new Card("Quicksilver", 1, 2),
    new Card("Dazzler", 2, 2),
    new Card("Ironheart", 3, 0),
    new Card("Gwenpool", 2, 1),
    new Card("Captain America", 3, 3),
    new Card("Namor", 4, 6),
    new Card("Ant Man", 1, 1),
    new Card("Thing", 4, 6),
    new Card("Black Panther", 5, 4),
    new Card("Cyclops", 3, 4)
]

/**
 * Returns a random integer between 0 and max (exclusive)
 * @param max max number (exclusive) of the random int
 * @returns 
 */
export function getRandomInt(max: number) {
    return Math.floor(Math.random() * (max - 1));
}

/**
 * Represents a player of Marvel Snap
 * Each player has their deck of cards to draw from, 
 * their current energy, and the current hand they can play from
 */
export class Player {
    public deck: Array<Card> = [...cardList];
    public energy: number = 1;

    public hand: Array<Card> = [];

    /**
     * Initializes the player's hand
     * Picks a Quicksilver card and 3 random cards from the deck
     * and adds them to the player's hand
     */
    public initHand() {
        let newDeck = [];
        for (let i = 0; i < 12; i++) {
            let idx = getRandomInt(this.deck.length);
            newDeck.push(this.deck[idx]);
            this.deck.splice(idx, 1);
        }

        this.deck = [...newDeck];

        // Make sure quicksilver is in the hand
        for (let i = 0; i < this.deck.length; i++) {
            if (this.deck[i].name === "Quicksilver") {
                this.hand.push(this.deck[i]);
                this.deck.splice(i, 1);
                break;
            }
        }
        
        for (let i = 0; i < 3; i++) {
            this.hand.push(this.deck.pop());
        }
    }

    /**
     * Draws a new card from the deck
     * If the player has 7 cards, they cannot draw a new card
     */
    public drawNewCard() {
        if (this.hand.length >= 7) 
            return;
        this.hand.push(this.deck.pop());
    }

    /**
     * Copy the current player
     * @returns a copy of this player
     */
    public Copy() {
        let result = new Player();

        result.deck = [];
        result.hand = []
        
        for (let card of this.deck) {
            result.deck.push(card.Copy());
        }

        for (let card of this.hand) {
            result.hand.push(card.Copy());
        }

        result.energy = this.energy;

        return result;
    }
    
}