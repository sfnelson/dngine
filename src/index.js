import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {App, Cell, boxOf} from './App';
import registerServiceWorker from './registerServiceWorker';

const Box = boxOf(Cell);
const Box2 = boxOf(Box);
const Box3 = boxOf(Box2);
const Box4 = boxOf(Box3);

class CellData {
    constructor(open) {
        this.open = open;
        this.left = open;
        this.right = open;
        this.top = open;
        this.bottom = open;
        this.active = false;
    }

    setOpen() {
        this.open = true;
    }

    setClosed() {
        this.open = false;
        this.left = false;
        this.right = false;
        this.top = false;
        this.bottom = false;
    }
}

function shiftUp(index) {
    if ((index & 2) === 2) {
        // console.debug("up: %s => %s", index, index ^ 2);
        return index ^ 2;
    } else {
        const parent = index >> 2;
        // console.debug("parent: %s => %s (%s)", index, parent, parent << 2);
        if ((parent | 1) !== 1) {
            const next = shiftUp(parent);
            // next may be undefined
            if (next >= 0) {
                // shifting up – i%4 is 0 or 1 (e.g. 8 => 0+2+0, 9 => 0+2+1)
                return (next << 2) + 2 + (index & 1);
            }
        }
    }
}

function shiftDown(index, max) {
    if ((index & 2) === 0) {
        // console.debug("down: %s => %s", index, index ^ 2);
        return index ^ 2;
    } else {
        const parent = index >> 2;
        // console.debug("parent: %s => %s (%s)", index, parent, parent << 2);
        // bail out when the next parent will exceed max
        if ((max >> 2) > 2) {
            const next = shiftDown(parent, max >> 2);
            // next may be undefined
            if (next >= 0) {
                // shifting down – i%4 is 2 or 3 (e.g. 2 => 8+0, 3 => 8+1)
                return (next << 2) + (index & 1);
            }
        }
    }
}

function shiftLeft(index) {
    if ((index & 1) === 1) {
        // console.debug("left: %s => %s", index, index ^ 1);
        return index ^ 1;
    } else {
        const parent = index >> 2;
        // console.debug("parent: %s => %s (%s)", index, parent, parent << 2);
        // bail out when parent is 0 or 2 – nothing to the left
        if ((parent | 2) !== 2) {
            const next = shiftLeft(parent);
            // next may be undefined
            if (next >= 0) {
                // shifting left – i%4 is 0 or 2 (e.g. 4 => 0+0+1, 6 => 0+2+1)
                return (next << 2) + (index & 2) + 1;
            }
        }
    }
}

function shiftRight(index, max) {
    if ((index & 1) === 0) {
        // console.debug("right: %s => %s", index, index ^ 1);
        return index ^ 1;
    } else {
        const parent = index >> 2;
        // console.debug("parent: %s => %s (%s)", index, parent, max >> 2);
        // bail out when the next parent will exceed max
        if ((max >> 2) > 2) {
            const next = shiftRight(parent, max >> 2);
            // next may be undefined
            if (next >= 0) {
                // shifting right - i%4 is 1 or 3 (e.g. 1 => 4+0, 3 => 4+2)
                return (next << 2) | (index & 2);
            }
        }
    }
}

function column(n) {
    if ((n | 3) === 3) {
        return n & 1;
    } else {
        return (column(n >> 2) << 2) + (n & 1);
    }
}

function row(n) {
    if ((n | 3) === 3) {
        return n & 2;
    } else {
        return (row(n >> 2) << 2) + (n & 2);
    }
}

function westOf(a, b) {
    return column(a) < column(b);
}

function eastOf(a, b) {
    return column(a) > column(b);
}

function northOf(a, b) {
    return row(a) < row(b);
}

function southOf(a, b) {
    return row(a) > row(b);
}

function sameColumn(a, b) {
    return column(a) === column(b);
}

function sameRow(a, b) {
    return row(a) === row(b);
}

function openNorth(data, index, max) {
    const next = shiftUp(index, max);
    const a = data[index];
    const b = data[next];
    a.open = true;
    a.top = true;
    b.bottom = true;
    b.open = true;
    return next;
}

function openEast(data, index, max) {
    const next = shiftRight(index, max);
    const a = data[index];
    const b = data[next];
    a.open = true;
    a.right = true;
    b.left = true;
    b.open = true;
    return next;
}

function openSouth(data, index, max) {
    const next = shiftDown(index, max);
    const a = data[index];
    const b = data[next];
    a.open = true;
    a.bottom = true;
    b.top = true;
    b.open = true;
    return next;
}


function openWest(data, index, max) {
    const next = shiftLeft(index, max);
    const a = data[index];
    const b = data[next];
    a.open = true;
    a.left = true;
    b.right = true;
    b.open = true;
    return next;
}

function openPath(store, from, to, step) {
    let next = from;
    while (next !== to) {
        next = step(store.data, next, store.max)
    }
}

class Store {
    constructor(size) {
        this.max = size;
        this.data = new Array(size);
        for (let i = 0; i < size; i++) {
            this.data[i] = new CellData(false);
        }
    }

    start(index) {
        this.data[index].active = true;
        this.render();
    }

    end(index) {
        this.data[index].active = false;
        this.render();
    }

    region(from, to) {
        from = parseInt(from, 10);
        console.debug(westOf(to, from), sameRow(to, from));

        if (sameColumn(from, to)) {
            northOf(to, from) && openPath(this, from, to, openNorth);
            southOf(to, from) && openPath(this, from, to, openSouth);
        } else if (sameRow(from, to)) {
            eastOf(to, from) && openPath(this, from, to, openEast);
            westOf(to, from) && openPath(this, from, to, openWest);
        }
        this.render();
    }

    toggle(index) {
        const cell = this.data[index];
        cell.open ? cell.setClosed() : cell.setOpen();
        // console.debug("cell: %s < %s > %s", shiftUp(index), index, shiftDown(index, this.max));
        this.render();
    }

    render() {
        ReactDOM.render(<App><Box4 data={this.data} target={this}/></App>, document.getElementById('root'));
    }
}

new Store(256).render();

registerServiceWorker();
