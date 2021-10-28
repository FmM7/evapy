'use strict';
class Evacuee {
    constructor(number, position) {
        this.number = number;
        // ??は左オペランドがnullishなら右オペランドを採用
        this.position = position ?? [0, 0];
    }
}

class Injured extends Evacuee {
    constructor(...args) {
        //superはthisを触る前
        super(...args);
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
const wholeCell = {}
const stillEvacuation = []
for (let i=1; i <= wid * hei; i++) {
    wholeCell[i] = new Cell();
}
wholeCell[Math.ceil(wid / 2)].state = "exit";
for (let i=1; i <= peopleNumber; i++) {
    stillEvacuation.push(i);
}

const HTMLUpdateCell = function() {
    const HTMLCellTable = document.createElement("table");
    HTMLCellTable.setAttribute("id", "cell-table");
    const HTMLCellTr = document.createElement("tr");
    for (let i=1; i<=wid; i++) {
        HTMLCellTr.appendChild(document.createElement("td"));
    }
    for (let i=1; i<=hei; i++) {
        HTMLCellTable.appendChild(HTMLCellTr.cloneNode(true));
    }
    document.getElementById("eva-table")
        .replaceChild(HTMLCellTable, document.getElementById("cell-table"));
}

const evaDictionary = {}
for (let i=1; i <= peopleNumber; i++) {
    const isInjured = Math.random() < injuredPossibility;
    evaDictionary[i] =
        isInjured ? new Injured(i, 0) : new Evacuee(i, 0);
    let evacueePosition = 0;
    do {
        evacueePosition = Math.floor(Math.random() * (wid * hei) + 1);
        evaDictionary[i].position =
            [evacueePosition % wid, Math.ceil(evacueePosition / wid)];
    } while (wholeCell[evacueePosition].state !== "empty");
    wholeCell[evacueePosition].state = "evacuee";
}

