import $ from "jquery";
import { Game } from "./Game";
import { Move } from "./Move";
import { getRandomInt } from "./Player";

console.log("client.js executing");

let game = new Game();

game.player.initHand();
game.AI.initHand();

game.StartTurn();

let validPlayerMoves = game.GetValidPlayerMoves();

let idx = getRandomInt(validPlayerMoves.length);

let playerMove = validPlayerMoves[idx];

console.log(playerMove);

let AIMove = game.AIMove();

console.log(AIMove);

console.log(game);

// game.MakeMove(playerMove, AIMove);
// console.log(game);

// let copiedGame = game.Copy();
// copiedGame.SwapPlayers()
// console.log(copiedGame);

//console.log(game.SwapPlayers());