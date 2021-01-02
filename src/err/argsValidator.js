const { additionalRollFlags } = require('../rolls/rollUtils');
const { NotFoundError, searchingObjType } = require('./errors');
const { capitalize } = require('../output/lang');
const { database } = require('../../settings.json');
const { isMove } = require('../combat/movement');
const { parse } = require('../rolls/expression/parser');
const { TileType } = require('../combat/map');

const isCharacterName = async (arg, mongo) => {
    await mongo.exists(database.collections.characters, { characterName: arg });
}

const isMapObject = async (arg, mongo) => {
    const combat = await mongo.tryFind(database.collections.data, { name: 'Combat' });
    if (!combat) {
        throw new NotFoundError(searchingObjType.dataFile, 'Combat');
    }
    const parsedMap = JSON.parse(combat.content.map);
    return Object.keys(parsedMap.specialObjects).includes(arg);
}

const isDataFileKey = async (arg, mongo, dataFileName) => {
    const dataFile = await mongo.tryFind(database.collections.data, { name: dataFileName });
    if (!dataFile) {
        throw new NotFoundError(searchingObjType.dataFile, dataFileName);
    }
    const skillName = capitalize(arg);
    return Object.keys(dataFile.content).includes(skillName);
}

const timeArgs = ['m', 'h'];
const noteArgs = ['add', 'del', 'list'];

const typeValidators = {
    'ability': (value, mongo) => isDataFileKey(value, mongo, 'Abilities'),
    'characterName': isCharacterName,
    'characterNames': (value, mongo) => value.split(',').every(elem => isCharacterName(elem, mongo)),
    'directions': (value, _mongo) => isMove(value),
    'mapObject': isMapObject,
    'noteArg': (value, _mongo) => noteArgs.includes(value),
    'number': (value, _mongo) => !isNaN(value),
    'rollExpression': (value, _mongo) => parse(value),
    'rollFlag': (value, _mongo) => Object.values(additionalRollFlags).includes(value),
    'skill': (value, mongo) => isDataFileKey(value, mongo, 'Skills'),
    'string': (value, _mongo) => typeof value === typeof 'string',
    'tileType': (value, _mongo) => Object.values(TileType).includes(value),
    'timeArg': (value, _mongo) => timeArgs.includes(value)
};

class ArgsValidator {
    static preCheck = async (argsSpecifics, commandArgs, mongo) => {
        const argsOptionsResults = [];
        for (const argsOption of argsSpecifics) {
            //check arg count
            if (argsOption.length != commandArgs.length && argsSpecifics.limitCount) continue;

            let counter = 0;
            const results = [];
            for (const argSpec of argsOption) {
                const argSpecResult = await typeValidators[argSpec.type](commandArgs[counter], mongo);
                results.push(argSpecResult);
                counter++;
            }
            argsOptionsResults.push(results);
        }

        return argsOptionsResults.length == 0 || argsOptionsResults.some(results => results.every(result => result));
    }
}

module.exports = {
    ArgsValidator
}