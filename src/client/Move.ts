import { Card } from "./Card";

/**
 * Represents a move in Marvel Snap
 * Each move has a dictionary of card locations
 * Which is the index of the card in the player's hand
 * and the index of the column the card is being played to
 */
export class Move {
    public cardLocations: {[index: number]: number} = {};

    /**
     * Calculate the energy cost of the move
     * @param i_hand the hand that the move is being played from
     * @returns the energy cost of this move
     */
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