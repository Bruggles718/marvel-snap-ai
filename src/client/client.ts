import $ from "jquery";
import { Game } from "./Game";
import { Move } from "./Move";
import { getRandomInt } from "./Player";

console.log("client.js executing");

let game = new Game();

const doGame = (i_game, i_depth) => {
    let g_copy = i_game.Copy();
    g_copy.SwapPlayers();
    
    let validPlayerMoves = g_copy.GetValidAIMoves();
    
    let idx = getRandomInt(validPlayerMoves.length);
    
    let playerMove = validPlayerMoves[idx];
    
    let AIMove = i_game.Copy().AIMove(i_depth);
    let validAIMoves = i_game.Copy().GetValidAIMoves();
    console.log(validAIMoves);
    console.log(validAIMoves);
    console.log(playerMove);
    console.log("AI MOVE: ");
    console.log(AIMove);
    console.log(i_game.Copy());
    i_game.MakeMove(playerMove, AIMove);

    console.log(i_game);
}

export function doMove(i_depth: number) {
    doGame(game, i_depth);
}

export function ScorePosition() {
    return game.ScorePosition();
}

(window as any).doMove = doMove;
(window as any).ScorePosition = ScorePosition;

window.onload = () => {
    

    game.player.initHand();
    game.AI.initHand();
    
    game.StartTurn();
}



// game.MakeMove(playerMove, AIMove);
// console.log(game);

// let copiedGame = game.Copy();
// copiedGame.SwapPlayers()
// console.log(copiedGame);

//console.log(game.SwapPlayers());