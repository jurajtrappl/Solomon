const lowerUpperBorder = {
    value: '═'
};

const cornerBorder = {
    upperLeft: '╔',
    upperRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝'
};

const sideBorder = {
    value: '║'
};

function CombatMapFromDb(dbObj) {
    const newMap = new CombatMap(dbObj.dimensions, false);
    newMap.tiles = dbObj.tiles;
    newMap.objects = dbObj.objects;
    return newMap;
}

const MapObjectType = {
    'p': "CHARACTER",
    'c': "COMPANION",
    'e': "ENEMY",
    'npc': "NPC",
};

class MapObject {
    constructor(name, type, row, col) {
        this.name = name;
        this.type = type;
        this.row = row;
        this.col = col;
        
        this.flag = name[0];
    }
}

class CombatMap {
    constructor(dimensions, doInitTiles) {
        this.dimensions = dimensions;

        if (doInitTiles) {
            this.initTiles();
        }

        this.objects = [];
    }

    initTiles() {
        this.tiles = new Array(this.dimensions.width); //??

        let row, col;
        for(col = 0; col < this.dimensions.width; col++) {
            this.tiles[col] = new Array(this.dimensions.height);
        }

        for(row = 0; row < this.dimensions.height; row++) {
            for(col = 0; col < this.dimensions.width; col++) {
                this.tiles[row][col] = ' ';
            }
        }

        this.setBorders();
    }

    setBorders() {
        let row, col;

        //the first and the last row
        for(col = 0; col < this.dimensions.width; col++) {
            this.tiles[0][col] = lowerUpperBorder.value;
            this.tiles[this.dimensions.height - 1][col] = lowerUpperBorder.value;
        }

        //side rows
        for(row = 0; row < this.dimensions.height; row++) {
            this.tiles[row][0] = sideBorder.value;
            this.tiles[row][this.dimensions.width - 1] = sideBorder.value;
        }

        //corners
        this.tiles[0][0] = cornerBorder.upperLeft;
        this.tiles[0][this.dimensions.width - 1] = cornerBorder.upperRight;
        this.tiles[this.dimensions.height - 1][0] = cornerBorder.bottomLeft;
        this.tiles[this.dimensions.height - 1][this.dimensions.width - 1] = cornerBorder.bottomRight;
    }

    toObj() {
        const obj = {};
        obj.dimensions = this.dimensions;
        obj.objects = this.objects;
        obj.tiles = this.tiles;
        return obj;
    }
}

module.exports = {
    CombatMap,
    CombatMapFromDb,
    MapObject,
    MapObjectType
}
