const { database } = require('../../settings.json');
const { DiceRoller } = require('../rolls/diceRoller');
const { LinkedList } = require('../dataStructures/LinkedList');
const { makeObjectEmbed } = require('../output/embed');
const { NotFoundError, searchingObjType } = require('../err/errors');
const { TileType } = require('../combat/map');

module.exports = {
    name: 'initiative',
    args: false,
    description: 'Rolls initiative for all combatants.',
    MAX_INITIATIVE: 30,
    initRolls: () => {
        let rolls = new Array(this.MAX_INITIATIVE);
        for (let i = 0; i < this.MAX_INITIATIVE; i++) {
            rolls[i] = new LinkedList();
        }
        return rolls;
    },
    findInitiativeOrder: (rolls) => {
        const initiativeOrder = {};
        for (let totalRoll = this.MAX_INITIATIVE - 1; totalRoll >= 0; totalRoll--) {
            //check if the linked list for the totalRoll value is empty
            let currentNode = rolls[totalRoll].head;
            if (currentNode) {
                while (currentNode) {
                    initiativeOrder[currentNode.value] = totalRoll + 1;
                    currentNode = currentNode.next;
                }
            }
        }

        return initiativeOrder;
    },
    async execute(message, _args, mongo, _discordClient) {
        //get combat
        const combat = await mongo.tryFind(database.collections.data, { name: 'Combat' });
        if (!combat) {
            throw new NotFoundError(searchingObjType.dataFile, 'Combat');
        }

        let dice = {};
        let initiativeBonus = 0;
        let roll = {};
        let rolls = this.initRolls();
        for (let combatantJSONString of combat.content.combatants) {
            const combatant = JSON.parse(combatantJSONString);

            if (combatant.type == TileType.character) {
                const sheet = await mongo.tryFind(database.collections.characters, { characterName: combatant.name });
                if (!sheet) {
                    throw new NotFoundError(searchingObjType.sheet, combatant.name);
                }

                initiativeBonus = sheet.initiative;
            }

            dice = new DiceRoller(`1d20+${initiativeBonus}`);
            rollResult = dice.roll();

            rolls[Number(roll.total) - 1].append(combatant.name);
        }

        const initiativeOrder = this.findInitiativeOrder(rolls);

        //update initiative order
        const newInitiativeOrder = {
            $set: {
                'content.initiativeOrder': JSON.stringify(initiativeOrder)
            }
        };

        await mongo.updateOne(database.collections.data, { name: 'Combat' }, newInitiativeOrder);

        //print the result to the players
        return await message.channel.send({
            embed: makeObjectEmbed(
                message.member.displayHexColor,
                initiativeOrder,
                'Initiative order'
            )
        });
    }
}