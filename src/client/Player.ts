import { Card } from "./Card"

export const cardList = [
    new Card("Medusa", 2, 2),
    new Card("Hulk", 6, 12),
    new Card("Quicksilver", 1, 2),
    new Card("Klaw", 5, 4),
    new Card("Ironheart", 3, 0),
    new Card("Domino", 2, 3),
    new Card("Captain America", 3, 3),
    new Card("Namor", 4, 6),
    new Card("Ant Man", 1, 1),
    new Card("Thing", 4, 6),
    new Card("Black Panther", 5, 4),
    new Card("Cyclops", 3, 4)
]

export function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export class Player {
    public deck: Array<Card> = [...cardList];
    public energy: number = 1;

    public hand: Array<Card> = [];

    public initHand() {
        for (let i = 0; i < 4; i++) {
            let idx = getRandomInt(this.deck.length);
            this.hand.push(this.deck[idx]);
            this.deck.splice(idx, 1);
        }
    }

    
}