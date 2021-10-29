'use strict';
class Evacuee {
    constructor(number, position) {
        this.number = number;
        // ??は左オペランドがnullishなら右オペランドを採用
        this.position = position ?? [0, 0];
        this.evacueeType = "evacuee";
        this.move = () => {
            const movingProbability = this.evacueeType === "evacuee" ? 1.0 : 0.5;
        };
    }
}

class Injured extends Evacuee {
    constructor(...args) {
        //superはthisを触る前
        super(...args);
        this.evacueeType = "injured";
    }
}

class Cell {
    constructor(state = "empty") {
        this.state = state;
    }
}


const [wid, hei] = [49, 49];
// ksが小さいと避難者が出口方向に向かいやすくなる
const ks = 3.0;
const peopleNumber = 144;
const injuredPossibility = 0.05;
const wholeCell = {};
const stillEvacuation = [];
for (let i=1; i <= wid * hei; i++) {
    wholeCell[i] = new Cell();
}
wholeCell[Math.ceil(wid / 2)].state = "exit";

const HTMLUpdateCell = function() {
    const HTMLCellTable = document.createElement("table");
    HTMLCellTable.setAttribute("id", "cell-table");
    for (let i=1; i<=hei; i++) {
        const HTMLCellTr = document.createElement("tr");
        for (let j=1; j<=wid; j++) {
            const HTMLCellTd = document.createElement("td");
            if (wholeCell[(i-1) * wid + j].state !== "empty") {
                HTMLCellTd.setAttribute("class", wholeCell[(i-1) * wid + j].state);
            }
            HTMLCellTr.appendChild(HTMLCellTd.cloneNode(true));
        }
        HTMLCellTable.appendChild(HTMLCellTr.cloneNode(true));
    }
    document.getElementById("eva-table")
        .replaceChild(HTMLCellTable, document.getElementById("cell-table"));
    
    
}

const evaDictionary = {};
for (let i=1; i <= peopleNumber; i++) {
    const isInjured = Math.random() < injuredPossibility;
    evaDictionary[i] =
        isInjured
        ? new Injured(i, 0)
        : new Evacuee(i, 0);
    stillEvacuation.push(i);
    let evacueePosition;
    do {
        evacueePosition = Math.floor(Math.random() * (wid * hei) + 1);
        evaDictionary[i].position =
            [evacueePosition % wid, Math.ceil(evacueePosition / wid)];
    } while (wholeCell[evacueePosition].state !== "empty");
    wholeCell[evacueePosition].state = evaDictionary[i].evacueeType;
}


window.onload = (event) => {
    HTMLUpdateCell();
};