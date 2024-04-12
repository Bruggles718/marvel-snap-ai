import { cardList } from "./Player";

export class Card {
    public name: string = "";
    public energy: number = 0;
    public power: number = 0;

    constructor(i_name: string, i_energy: number, i_power: number) {
        this.name = i_name;
        this.energy = i_energy;
        this.power = i_power;
    }

    public ToHash() {
        return this.name;
    }

    public ToHTML() {
        return `<div class="w3-row power-energy placed-card">
                    <p class="w3-col w3-left-align s6">${this.energy}</p> 
                    <p class="w3-col w3-right-align s6">${this.power}</p>
                </div>
                <p class="w3-row card-name">${this.name}</p>`;
    }
}