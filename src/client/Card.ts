export class Card {
    public name: string = "";
    public energy: number = 0;
    public power: number = 0;

    constructor(i_name: string, i_energy: number, i_power: number) {
        this.name = i_name;
        this.energy = i_energy;
        this.power = i_power;
    }
}