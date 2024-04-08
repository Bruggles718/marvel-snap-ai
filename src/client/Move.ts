import { Card } from "./Card";

export class Move {
    // key is index of card in player hand
    // value is index of column
    public cardLocations: {[index: number]: number} = {};

    public CalculateEnergyCost(i_hand: Array<Card>) {
        if (!i_hand) {
            return 0;
        }
        let result = 0;
        for (let idx in this.cardLocations) {
            result += i_hand[parseInt(idx)].energy;
        }
        return result;
    }
}