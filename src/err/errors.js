const searchingObjType = {
    character : 'Character',
    dataFile: 'Data file',
    player: 'Player with discord ID',
    sheet: 'Sheet',
    time: 'Time'
}

class ArgError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ArgError';
    }
}

class ArgsCountError extends ArgError {
    constructor(actualCount, requiredCount) {
        super(`Got ${actualCount} args, expected ${requiredCount}`);
        this.name = 'ArgsCountError';
    }
}

class DuplicateObjectError extends Error {
    constructor(obj) {
        super(`${obj} already exists.`);
        this.name = 'DuplicateObjectError';
    }
}

class InvalidArgTypeError extends ArgError {
    constructor(arg, expectedType) {
        super(`Arg: ${arg}, expected type ${expectedType} got ${typeof arg}`);
        this.name = 'InvalidArgTypeError';
    }
} 

class NotExistingError extends Error {
    constructor(obj) {
        super(`${obj} does not exist.`);
        this.name = 'NotExistingError';
    }
}

class NotFoundError extends Error {
    constructor(type, obj) {
        super(`${type} not found: ${obj}`);
        this.name = 'NotFoundError';
    }
}

class OutOfRangeError extends Error {
    constructor(obj, lowerBound, upperBound) {
        super(`${obj} is out of range. The range is from ${lowerBound} to ${upperBound}.`);
        this.name = 'OutOfRangeError';
    }
}

class NegativeDamageError extends Error {
    constructor() {
        super(`It is not allowed to deal negative amount of damage.`);
        this.name = 'NegativeDamageError';
    }
}

class NotEnoughError extends Error {
    constructor(obj, current, required) {
        super(`There is ${current} of ${obj}. You need at least ${required}.`);
        this.name = 'NotEnoughError';
    }
}

class RollError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RollError';
    }
}

class InvalidRollExpressionError extends RollError {
    constructor(expression) {
        super(`${expression} is not a valid expression.`);
        this.name = 'InvalidRollExpressionError';
    }
}

class MapTileOccupiedError extends Error {
    constructor() {
        super('Map tile is already occupied by a different object.');
        this.name = 'MapTileOccupiedError';
    }
}

module.exports = {
    ArgsCountError,
    DuplicateObjectError,
    NegativeDamageError,
    InvalidArgTypeError,
    InvalidRollExpressionError,
    MapTileOccupiedError,
    NotEnoughError,
    NotExistingError,
    NotFoundError,
    OutOfRangeError,
    searchingObjType
}