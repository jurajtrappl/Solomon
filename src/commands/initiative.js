const settings = require('../../settings.json');
const { askedForHelp, printHelpEmbed } = require('../help');
const { ExpressionDice } = require('../dice');
const { objectEmbed } = require('../embed');
const { TileType } = require('../map');
const { LinkedList } = require('../LinkedList');

module.exports = {
    name: 'initiative',
    args: false,
    description: 'Rolls initiative for all combatants.',
    MAX_INITIATIVE: 30,
    initRolls: function () {
        let rolls = new Array(this.MAX_INITIATIVE);
        for (let i = 0; i < this.MAX_INITIATIVE; i++) {
            rolls[i] = new LinkedList();
        }
        return rolls;
    },
    findInitiativeOrder(rolls) {
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
    async execute(message, _args, db, _client) {
        if (askedForHelp(args)) {
            printHelpEmbed(this.name, message, db);
            return;
        }

        //get combatants
        const resultCombatants = await db
            .collection(settings.database.collections.data)
            .find({
                name: 'Combat',
            })
            .toArray();
        let combatants = resultCombatants[0].content.combatants;

        let expr = '';
        let expressionDice = {};
        let initiativeBonus = 0;
        let rollResult = {};
        let rolls = this.initRolls();
        for (let combatantJSONString of combatants) {
            const combatant = JSON.parse(combatantJSONString);

            if (combatant.type == TileType.character) {
                const resultSheet = await db
                    .collection(settings.database.collections.characters)
                    .find({
                        characterName: combatant.name,
                    })
                    .toArray();
                const sheet = resultSheet[0];

                initiativeBonus = sheet.initiative;
            }

            expr = `1d20+${initiativeBonus}`;
            expressionDice = new ExpressionDice(expr);
            rollResult = expressionDice.roll();

            rolls[Number(rollResult.totalRoll) - 1].append(combatant.name);
        }

        const initiativeOrder = this.findInitiativeOrder(rolls);

        //update initiative order
        await db.collection(settings.database.collections.data).updateOne({
            name: 'Combat'
        }, {
            $set: {
                'content.initiativeOrder': JSON.stringify(initiativeOrder)
            }
        }, (err) => {
            if (err) throw err;
        });

        //print the result to the players
        return await message.channel.send({
            embed: objectEmbed(
                message.member.displayHexColor, 
                initiativeOrder, 
                'Initiative order'
                )
        });
    }
}