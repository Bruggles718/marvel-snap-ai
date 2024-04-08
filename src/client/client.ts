import $ from "jquery";
import { Game } from "./Game";
import { Move } from "./Move";
import { getRandomInt } from "./Player";

console.log("client.js executing");

let game = new Game();

const doGame = (i_game) => {
    let g_copy = i_game.Copy();
    g_copy.SwapPlayers();
    
    let validPlayerMoves = g_copy.GetValidAIMoves();
    
    let idx = getRandomInt(validPlayerMoves.length);
    
    let playerMove = validPlayerMoves[idx];
    
    //console.log(playerMove);
    
    let AIMove = i_game.AIMove(playerMove, 2);
    
    //console.log(AIMove);
    i_game.MakeMove(playerMove, AIMove);

    console.log(i_game);
}

export function doMove() {
    doGame(game);
}

(window as any).doMove = doMove;

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