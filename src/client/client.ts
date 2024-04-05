import $ from "jquery";
import { Game } from "./Game";
import { Move } from "./Move";

console.log("client.js executing");

let game = new Game();

game.player.initHand();
game.AI.initHand();

game.StartTurn();

let playerMove = new Move();
playerMove.cardLocations[0] = 0;

console.log(playerMove);

let AIMove = game.AIMove();

console.log(AIMove);

console.log(game);

console.log(game.GetValidAIMoves());