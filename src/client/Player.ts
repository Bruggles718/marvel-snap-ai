import { Card } from "./Card"

export const cardList = [
    // List out all cards here
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