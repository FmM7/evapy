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
const peopleNumber = 81;
const injuredPossibility = 0.05;

const wholeCell = {}
for (let i=1; i <= wid * hei; i++) {
    wholeCell[i] = new Cell();
}

const evaDictionary = {}
for (let i=1; i <= people_num; i++) {
    const isInjured = Math.random() < injuredPossibility;
    evaDictionary[i] =
        isInjured ? new Injured(i, 0) : new Evacuee(i, 0);
    const evacueePosition =
        Math.floor(Math.random() * (wid * hei) + 1);
    evaDictionary[i].position =
        [evacueePosition % wid, Math.ceil(evacueePosition / wid)];
    wholeCell[evacueePosition].state = "evacuee";
}