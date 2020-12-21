const TileType = {
    free: 0,
    character: 1,
    enemy: 2,
    companion: 3,
    npc: 4,
    border: 5
};

const TileTypeArgs = {
    'f': TileType.free,
    'p': TileType.character,
    'e': TileType.enemy,
    'c': TileType.companion,
    'n': TileType.npc
};

class Tile {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

//free tile singleton
const FreeTile = (function() {
    let instance;

    function createInstance() {
        const freeTile = new Tile(TileType.free, ' ');
        return freeTile;
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

const borders = {
    lowerUpper: new Tile(TileType.border, '═'),
    corners: {
        upperLeft: new Tile(TileType.border, '╔'),
        upperRight: new Tile(TileType.border, '╗'),
        bottomLeft: new Tile(TileType.border, '╚'),
        bottomRight: new Tile(TileType.border, '╝')
    },
    side: new Tile(TileType.border, '║')
};

class Map {
    constructor(dimensions) {
        this.dimensions = dimensions;
        this.initTiles();
        this.specialObjects = {};
    }

    initTiles() {
        this.tiles = new Array(this.dimensions.width); //??

        let row, col;
        for(col = 0; col < this.dimensions.width; col++) {
            this.tiles[col] = new Array(this.dimensions.height);
        }

        for(row = 0; row < this.dimensions.height; row++) {
            for(col = 0; col < this.dimensions.width; col++) {
                this.tiles[row][col] = FreeTile.getInstance();
            }
        }

        this.setBorders();
    }

    setBorders() {
        let row, col;

        //the first and the last row
        for(col = 0; col < this.dimensions.width; col++) {
            this.tiles[0][col] = borders.lowerUpper;
            this.tiles[this.dimensions.height - 1][col] = borders.lowerUpper;
        }

        //side rows
        for(row = 0; row < this.dimensions.height; row++) {
            this.tiles[row][0] = borders.side;
            this.tiles[row][this.dimensions.width - 1] = borders.side;
        }

        //corners
        this.tiles[0][0] = borders.corners.upperLeft;
        this.tiles[0][this.dimensions.width - 1] = borders.corners.upperRight;
        this.tiles[this.dimensions.height - 1][0] = borders.corners.bottomLeft;
        this.tiles[this.dimensions.height - 1][this.dimensions.width - 1] = borders.corners.bottomRight;
    }
}

module.exports = {
    Map,
    Tile,
    TileType,
    TileTypeArgs
}
