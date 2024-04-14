import { Card } from "./Card";

export class Column {
    public playerCards: Array<Card> = [];
    public AICards: Array<Card> = [];

    public revealed: boolean = false;

    public ability: string = "";

    public GetPlayerValue() {
        return this.GetCardListValue(this.playerCards);
    }

    public GetAIValue() {
        return this.GetCardListValue(this.AICards);
    }

    public GetCardListValue(i_cardList: Array<Card>) {
        let result = 0;
        for (let card of i_cardList) {
            result += card.power;
        }
        return result;
    }

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

    public ToHTML() {
        return `<header>${this.GetAIValue()}</header>
        <p>${this.revealed ? this.ability : ""}</p>
        <header>${this.GetPlayerValue()}</header>`
    }

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