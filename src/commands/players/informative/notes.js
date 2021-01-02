const { database } = require('../../../../settings.json');
const { NotFoundError, OutOfRangeError, searchingObjType } = require('../../../err/errors');

module.exports = {
    name: 'notes',
    description: 'Manages players notes.',
    args: {
        limitCount: false,
        specifics: [
            [{ type: 'noteArg' }],
            [{ type: 'noteArg' }, { type: 'number' }]
        ]
    },
    async execute(message, args, mongo, _discordClient) {
        //get note block
        const noteBlock = await mongo.tryFind(database.collections.notes, { discordID: message.author.id });
        if (!noteBlock) {
            throw new NotFoundError(searchingObjType.note, message.author.id);
        }
        const notes = noteBlock.notes;

        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new NotFoundError(searchingObjType.player, message.author.id);
        }
        const characterName = playerData.character;

        const color = message.member.displayHexColor;
        if (args.length == 0) {
            const embed = (notes.length == 0) ? makeEmptyNoteBlockEmbed(characterName, color) : makeNoteBlockEmbed(characterName, color, notes);

            return await message.reply({
                embed: embed
            });
        } else if (args.length == 2 && args[0] == 'del') {
            if (notes.length == 0) {
                return await message.reply({
                    embed: makeEmptyNoteBlockEmbed(characterName, color)
                });
            }

            const [ , numberOfNoteToDelete ] = args;

            if (numberOfNoteToDelete < 0 || notes.length < numberOfNoteToDelete) {
                throw new OutOfRangeError('Note number', 0, notes.length);
            }

            notes.splice(numberOfNoteToDelete - 1, 1);
            
            const newNoteBlockValue = {
                $set: {
                    'notes': notes
                }
            };

            await mongo.updateOne(database.collections.notes, { discordID: message.author.id }, newNoteBlockValue);
        } else {
            const newNote = args.join(' ');

            const newNoteBlockValue = {
                $push: {
                    'notes': newNote
                }
            };

            await mongo.updateOne(database.collections.notes, { discordID: message.author.id }, newNoteBlockValue);
        }
    }
};