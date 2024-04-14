import $ from "jquery";
import { Game } from "./Game";
import { Move } from "./Move";
import { getRandomInt } from "./Player";

// Current card player is attempting to move
let currentSelectedHandIdx = undefined;

// Current move for this turn
let currentMove: Move = new Move();

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

let energy = 0;

function populateHandHTML() {
    for (let i = 0; i < game.player.hand.length; i++) {
        const cardElement = document.getElementById("Card-" + i.toString());
        if (Object.keys(currentMove.cardLocations).indexOf(i.toString()) >= 0) {
            cardElement.innerHTML = "";
            continue;
        }
        const card = game.player.hand[i];
        
        cardElement.innerHTML = card.ToHTML();
    }
}

function populateColumsHTML() {
    let columnNames = ["Left", "Middle", "Right"];

    for (let i = 0; i < game.columns.length; i++) {
        let column = game.columns[i];

        for (let j = 0; j < column.AICards.length; j++) {
            const columnSpotElement = document.getElementById(columnNames[i] + " AI Index-" + j.toString());
            columnSpotElement.innerHTML = column.AICards[j].ToHTML();
        }
    }

    for (let i = 0; i < game.columns.length; i++) {
        let column = game.columns[i];

        for (let j = 0; j < column.playerCards.length; j++) {
            const columnSpotElement = document.getElementById(columnNames[i] + " Player Index-" + j.toString());
            columnSpotElement.innerHTML = column.playerCards[j].ToHTML();
        }

        if (column.playerCards.length >= 4) {
            continue;
        }

        for (let idx in currentMove.cardLocations) {
            const columnSpotElement = document.getElementById(columnNames[i] + " Player Index-" + column.playerCards.length.toString());
            if (currentMove.cardLocations[idx] === i) {
                columnSpotElement.innerHTML = game.player.hand[idx].ToHTML();
            }
        }
    }

    for (let i = 0; i < game.columns.length; i++) {
        const columnLocation = document.getElementById(columnNames[i] + "Location");
        columnLocation.innerHTML = game.columns[i].ToHTML();
    }
}

window.onload = () => {
    

    game.player.initHand();
    game.AI.initHand();

    game.columns[0].revealed = true;

    console.log(game.AI.hand);
    
    game.StartTurn();

    populateHandHTML();
    populateColumsHTML();
    
    energy = game.round;

    populateEnergy();

    window.addEventListener("click", function(event) {
        if (event.target instanceof HTMLElement && (event.target instanceof HTMLButtonElement || event.target.parentNode instanceof HTMLButtonElement)) {
            return;
        }
        currentSelectedHandIdx = undefined;
    });

    initializePlayerHand();

    initializeColumnIdxs();

    initializeButtons();
   
}


// This can be how we set up the hand for the player
// so they can click things
function initializePlayerHand() {
    for (let i = 0; i < 7; i++) {
        const button = document.getElementById(`Card-${i}`) as HTMLButtonElement;
        
        button.onclick = () => {
            selectedCard(button);
        }
    }
}

// This can be how we let users actually click on the column indicies
function initializeColumnIdxs() {
    const playerColumns = ['Left', 'Middle', 'Right'];

    for (let j = 0; j < 3; j++) {
        const prefex = playerColumns[j] + ' Player';

        for (let l = 0 ; l < 4 ; l++) {
            const button = document.getElementById(`${prefex} Index-${l}`) as HTMLButtonElement;
            button.onclick = () => {selectedPlayerMove(button);}
        }

    }
}

function populateEnergy() {
    document.getElementById("Energy").innerHTML = `<p>${energy}</p>`
}

// This can be how we set up the Retreat and En Turn buttons
function initializeButtons() {
    
    // Retreat can be whatever
    const retreat = document.getElementById("Retreat") as HTMLButtonElement;
    retreat.onclick = () => {
        window.close();
    }

    // This is more important
    const endTurn = document.getElementById("End Turn") as HTMLButtonElement;
    endTurn.onclick = () => {
        // call AI's minimax to get their move
        const AIMove = game.AIMove(2);
        // then it will call game.MakeMove(playerMove, AIMove)
        console.log("AI MOVE: ");
        console.log(AIMove);

        console.log(game.Copy());

        game.MakeMove(currentMove, AIMove);

        console.log(game);

        currentMove = new Move();
        // Which should make the moves, change the turn, and add cards
        // the cards that are added will have to edit the html
        populateHandHTML();
        populateColumsHTML();

        energy = game.round;
        populateEnergy();
        // so we should probably do them here
        // As in we make the move return the cards it's adding as well as the new turn
    }
}

// Set the selected card
function selectedCard(button: HTMLButtonElement) {
    if (button.style.display !== "none") {
    const idx = parseInt(button.id.split("-")[1]);
    // maybe here we grab the card and only have it be selected 
    // if it's less energy than the game round
    currentSelectedHandIdx = idx;  
    }
}

// Set the selected player move
function selectedPlayerMove(button: HTMLButtonElement) {
    if (currentSelectedHandIdx === undefined) {
        return;
    }


    const side = button.id.split(" ")[0];
    const index = button.id.split(" ")[2].split("-")[1];
    const sideValue = side === "Left" ? 0 : side === "Middle" ? 1 : 2;
    console.log(sideValue);

    const tempMove = new Move();

    for (let idx in currentMove.cardLocations) {
        tempMove.cardLocations[idx] = currentMove.cardLocations[idx];
    }

    tempMove.cardLocations[currentSelectedHandIdx] = sideValue;

    if (energy - tempMove.CalculateEnergyCost(game.player.hand) < 0) {
        console.error("Invalid move!");
        return;
    }

    currentMove.cardLocations[currentSelectedHandIdx] = sideValue;

    currentSelectedHandIdx = undefined;

    populateHandHTML();
    populateColumsHTML();
}

// game.MakeMove(playerMove, AIMove);
// console.log(game);

// let copiedGame = game.Copy();
// copiedGame.SwapPlayers()
// console.log(copiedGame);

//console.log(game.SwapPlayers());