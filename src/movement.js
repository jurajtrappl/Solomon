const { TileType } = require('./map.js');

const directions = {
    'l': {
        x: 0,
        y: -1
    },
    'r': {
        x: 0,
        y: 1
    },
    'u': {
        x: -1,
        y: 0
    },
    'd': {
        x: 1,
        y: 0
    }
};

class MoveVector {
    constructor({x, y}) {
        this.x = x;
        this.y = y;
    }

    add({x, y}) {
        this.x += x;
        this.y += y;
    }

    isInBounds(borders) {
        return (this.x >= borders.upper && this.x <= borders.bottom) && (this.y >= borders.left && this.y <= borders.right);
    }
}

const initBorders = (dimensions) => {
    return {
        left: 1,
        right: dimensions.width - 2,
        upper: 1,
        bottom: dimensions.height - 2
    }
}

const isMove = (direction) => Object.keys(directions).includes(direction);

const moveObj = (currentPosition, tiles, dimensions, directionsArgs) => {
    const moveVector = new MoveVector(currentPosition);
    const borders = initBorders(dimensions);

    for(let i = 0; i < directionsArgs.length; i++) {
        const direction = directionsArgs[i];

        if (!isMove(direction)) {
            throw new Error('Invalid direction.');
        }

        moveVector.add(directions[direction]);

        if (!moveVector.isInBounds(borders)) {
            throw new Error('Out of bounds.');
        }

        if (tiles[moveVector.x][moveVector.y].type != TileType.free) {
            throw new Error('Can not move there.');
        }
    }

    return moveVector;
}

module.exports = {
    moveObj
}