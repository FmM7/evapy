'use strict';

/** @typedef {number} PositionNumber - wholeCell内の位置(number)  */
/** @typedef {number[]} PositionArray - wholeCell内の位置(number[])  */
/** @typedef {PositionNumber | PositionArray} Position - wholeCell内の位置(number | number[]) */
/** @typedef {string} EvacueeType - 避難者の種類 */
/** @typedef {Object} EvacueeT - 避難者 */

/**
 * 避難者のクラス
 * @type {EvacueeT}
 */
class Evacuee {
    /**
     * @param {number} evacueeNumber - 避難者の識別用番号
     * @param {PositionNumber} position - 避難者の位置
     */
    constructor(evacueeNumber, position) {
        /** @type {number} */
        this.evacueeNumber = evacueeNumber;
        /** @type {PositionNumber} */
        this.position = position;
        /** @type {EvacueeType} */
        this.evacueeType = "evacuee";
    }
}

/**
 * 負傷している(一定確率で動けない)避難者のクラス
 * @type {EvacueeT} 
 * @extends {Evacuee} 
 */
class Injured extends Evacuee {
    constructor(...args) {
        //superはthisを触る前
        super(...args);
        /** @type {EvacueeType} */
        this.evacueeType = "injured";
    }
}

/** @typedef {Object} CellT - wholeCellを構成するセル一つずつ */
/** @typedef {string} CellState - Cellの状態を表す */
/**
 * 構成セルのクラス
 * @type {CellT}
 */
class Cell {
    /** @param {CellState} state - Cellの状態を表す */
    constructor(state = "empty") {
        /** @type {CellState} */
        this.state = state;
    }
}

//wholeCellの大きさ (横幅: wid, 縦: hei)
const [wid, hei] = [49, 49];
// ksが小さいと避難者が出口方向に向かいやすくなる
const ks = 3.0;
//避難者の数
const peopleNumber = 144;
//EvacueeがInjuredである確率
const injuredPossibility = 0.05;
//Injuredが移動できる確率
const injuredMovePossibility = 0.5;
/** @type {PositionNumber} */
const exitPosition = Math.ceil(wid / 2);

/** @type {{[x: PositionNumber]: CellT}} */
const wholeCell = {};
for (let i=1; i <= wid * hei; i++) {
    wholeCell[i] = new Cell();
}
wholeCell[exitPosition].state = "exit";

/** eva-tableをwholeCellの内容に更新する */
const HTMLUpdateCell = function(tableData = wholeCell) {
    // wholeCellを表すtable要素 
    const HTMLCellTable = document.createElement("table");
    HTMLCellTable.setAttribute("id", "cell-table");
    for (let i=1; i<=hei; i++) {
        // tableの列を表すtr要素、hei個
        const HTMLCellTr = document.createElement("tr");
        for (let j=1; j<=wid; j++) {
            // Cellを表すtd要素、wid個
            const HTMLCellTd = document.createElement("td");
            if (tableData[(i-1) * wid + j].state !== "empty") {
                // Cellがemptyでない場合、CellStateと同名のクラスを与える
                HTMLCellTd.setAttribute("class", tableData[(i-1) * wid + j].state);
            }
            HTMLCellTr.appendChild(HTMLCellTd.cloneNode(true));
        }
        HTMLCellTable.appendChild(HTMLCellTr.cloneNode(true));
    }
    document.getElementById("eva-table")
    .replaceChild(HTMLCellTable, document.getElementById("cell-table"));    
}

/**
 * wholeCell内の位置を表すPositionNumber及びPositionArrayを相互に変換する
 * ex) ([wid, hei] = [5, 3]において)
 *     (13) => [2, 3]
 *     [4,2] => 9
 * @param {PositionNumber | PositionArray} positionArgument - wholeCell内の位置を表す変数
 * @returns {PositionNumber | PositionArray} 変換後(型は引数と異なる)
 */
const positionConverter = function(positionArgument) {
    if (typeof positionArgument === "number") {
        return [(positionArgument - 1) % wid + 1, Math.ceil(positionArgument / wid)];
    } else if (typeof positionArgument === "object") {
        return (positionArgument[1] - 1) * wid + positionArgument[0];
    }
};


/**
 * 避難中のEvacueeの一覧。evacueeNumberで管理する
 * @type {number[]}
 */
let stillEvacuation = [];
/**
 * evacueeNumber毎にEvacuee
 * @type {Object<number, EvacueeT>}
 */
const evaDictionary = {};
for (let i=1; i <= peopleNumber; i++) {
    const isInjured = Math.random() < injuredPossibility;
    evaDictionary[i] =
    isInjured
    ? new Injured(i, 0)
    : new Evacuee(i, 0);
    stillEvacuation.push(i);
    /** @type {PositionNumber} */
    let evacueePosition;
    do {
        /*
            0 <= x < (wid * hei)の範囲にあるxを切り捨て(=[x])、+1する
            1 <= [x] + 1 <= (wid * hei)
        */
        evacueePosition = Math.floor(Math.random() * (wid * hei) + 1);
    } while (wholeCell[evacueePosition].state !== "empty");
    evaDictionary[i].position = evacueePosition;

    /** @type {CellState} */
    wholeCell[evacueePosition].state = evaDictionary[i].evacueeType;
    /**
     * Evacueeが移動する関数
     * @returns {{param: string,
     *            moveFrom: PositionNumber,
     *            moveTo: PositionNumber}}
     *     param - 移動の結果を表す ["injured", "exited", "moved", "collision"]
     *     moveFrom - 移動元の地点
     *     moveTo - 移動先として選ばれた地点
     */
    evaDictionary[i].move = function() {
        /**
         * 移動先の候補のArray
         * @type {PositionNumber[]}
         */
        const movablePlaces = [];
        {
            //端の場合を除いてそれぞれ左右上下のセルを移動候補に加える
            (this.position - 1) % wid && movablePlaces.push(this.position - 1);
            this.position % wid && movablePlaces.push(this.position + 1);
            this.position > wid && movablePlaces.push(this.position - wid);
            this.position <= wid * (hei - 1) && movablePlaces.push(this.position + wid);
        }
        /** @type {PositionArray} */
        const thisPositionArray = positionConverter(this.position);
        /** @type {PositionArray} */
        const exitArray = positionConverter(exitPosition);
        /** 
         * 現在地点から出口までの距離
         * @type {number}
         */
        const Si = Math.sqrt(
            (thisPositionArray[0] - exitArray[0]) ** 2
            + (thisPositionArray[1] - exitArray[1]) ** 2
        );

        /** @type {Object<number, {position:PositionNumber, possibility:number}>} */
        const movablePossibility = {};
        /**
         * 移動確率を足していく
         * @type {number}
         */
        let possibilitySum = 0;
        for (let i=1; i<=movablePlaces.length; i++) {
            /** @type {PositionArray} */
            const iArray = positionConverter(movablePlaces[i - 1]);
            /** 
             * 移動先から出口までの距離
             * @type {number}
             */
            const Sj = Math.sqrt(
                (iArray[0] - exitArray[0]) ** 2
                + (iArray[1] - exitArray[1]) ** 2
            );
            possibilitySum += Math.exp(ks * (Si - Sj));
            movablePossibility[i] = {
                position: movablePlaces[i - 1],
                possibility: possibilitySum,
            };
        }
        /**
         * 0 <= moveRandomNumber <= possibilitySum
         * ex) movablePossibility[i].possibility = [1, 2, 4, 8, 16]
         *     moveRandomNumber = 7のとき
         * movablePossibility[2] <= moveRandomNumber <= movablePossibility[3]
         * 従って4個目の要素が選択される
         * @type {number}
         */
        const moveRandomNumber = Math.random() * possibilitySum;
        /** @type {PositionNumber} */
        let moveResult;
        for (let i=1; i<=movablePlaces.length; i++) {
            if (movablePossibility[i].possibility >= moveRandomNumber) {
                moveResult = movablePossibility[i].position;
                break;
            }
        }
        // Injuredについて一定確率で動かない
        if (this.evacueeType === "injured") {
            if (injuredMovePossibility < Math.random()) {
                return {
                    param: "injured",
                    moveFrom: this.position,
                    moveTo: moveResult,
                };
            }
        }
        // 移動先の状態によって処理を分岐
        switch (wholeCell[moveResult].state) {
            case "empty":
                wholeCell[moveResult].state = this.evacueeType;
                return {
                    param: "moved",
                    moveFrom: this.position,
                    moveTo: moveResult,
                };
            case "exit":
                stillEvacuation = stillEvacuation.filter((element) => {
                    return element !== this.evacueeNumber;
                });
                return {
                    param: "exited",
                    moveFrom: this.position,
                    moveTo: moveResult,
                    moveTurn: turn,
                };
            default:
                return {
                    param: "collision",
                    moveFrom: this.position,
                    moveTo: moveResult,
                };
        }
    };
}

/**
 * turn(1turn毎に各Evacueeが1回行動する)毎にwholeCellを保存する
 * @type {{[turn: number]: {[x: PositionNumber]: CellT}}}
 */
const wholeCellByTurn = {};
let turn = 0;
const exitLog = [];
//eva-table読み込み後、HTMLUpdateCell()を呼び出す
window.onload = () => {
    HTMLUpdateCell();
    while (stillEvacuation.length) {
        turn += 1;
        // movedとexitedを返した避難者を集める
        const movedAnyway = [];
        for (let i of stillEvacuation) {
            const moveReturn = evaDictionary[i].move();
            if ("exited" === moveReturn.param) {
                exitLog.push(moveReturn);
            }
            if (["moved", "exited"].includes(moveReturn.param)) {
                movedAnyway.push(moveReturn.moveFrom);
                evaDictionary[i].position = moveReturn.moveTo;
            }
        }
        for (let i of movedAnyway) {
            wholeCell[i].state = "empty";
        }
        wholeCellByTurn[turn] = JSON.parse(JSON.stringify(wholeCell));
        HTMLUpdateCell();
    }
};
