import { cardList } from "./Player";

/**
 * Represents a card in Marvel Snap
 * Each card has the name, the energy cost, and it's current power
 */
export class Card {
    public name: string = "";
    public energy: number = 0;
    public power: number = 0;

    constructor(i_name: string, i_energy: number, i_power: number) {
        this.name = i_name;
        this.energy = i_energy;
        this.power = i_power;
    }

    /** 
     * Custom To hash function for the card
    */
    public ToHash() {
        return this.name;
    }

    /**
     * Function to display card to our page
     */
    public ToHTML() {
        return `<div class="w3-row power-energy placed-card">
                    <p class="w3-col w3-left-align s6">${this.energy}</p> 
                    <p class="w3-col w3-right-align s6">${this.power}</p>
                </div>
                <p class="w3-row card-name placed-card">${this.name}</p>`;
    }

    /**
     * Copy the current card
     * @returns a copy of the card
     */
    public Copy() {
        return new Card(this.name, this.energy, this.power);
    }
}