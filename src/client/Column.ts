import { Card } from "./Card";

/**
 * Represents a Location in Marvel Snap
 * Each location has a list of cards that have been played 
 * by  the player and the AI, and stores if it has been revealed
 * And the ability of the location is represented as a string with
 * the locations name
 */
export class Column {
    public playerCards: Array<Card> = [];
    public AICards: Array<Card> = [];

    public revealed: boolean = false;

    public ability: string = "";

    /**
     * Get the value of the player cards in this column
     * @returns the value of the player cards
     */
    public GetPlayerValue() {
        return this.GetCardListValue(this.playerCards);
    }

    /**
     * Get the value of the AI cards in this column
     * @returns the value of the AI cards
     */
    public GetAIValue() {
        return this.GetCardListValue(this.AICards);
    }

    /**
     * Given a list of cards, get the total value of the cards
     * @param i_cardList list of cards to get the value of
     * @returns the value of those cards
     */
    public GetCardListValue(i_cardList: Array<Card>) {
        let result = 0;
        for (let card of i_cardList) {
            result += card.power;
        }
        return result;
    }

    /**
     * Custom to hash function for the column
     * @returns a hash unique to this column
     */
    public ToHash() {
        let result = "";
        const iDefault = 2;
        let i = iDefault;
        for (let card of this.playerCards) {
            result += card.ToHash();
            i++;
        }

        i = iDefault;
        for (let card of this.AICards) {
            result += card.ToHash();
            i++;
        }

        return result;
    }

    /**
     * Function to display the column to our page
     * @returns the HTML representation of the column
     */
    public ToHTML() {
        return `<header>${this.GetAIValue()}</header>
        <p>${this.revealed ? this.ability : ""}</p>
        <header>${this.GetPlayerValue()}</header>`
    }

    /**
     * Copy the current location
     * @returns a copy of this location
     */
    public Copy() {
        let result = new Column();
        
        for (let card of this.playerCards) {
            result.playerCards.push(card.Copy());
        }

        for (let card of this.AICards) {
            result.AICards.push(card.Copy());
        }

        result.revealed = this.revealed;
        result.ability = this.ability;

        return result;
    }
}