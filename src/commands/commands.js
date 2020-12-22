const settings = require('../../settings.json');
const { helpEmbed } = require('../embed');

module.exports = {
    name: 'commands',
    args: false,
    description: 'List of all commands.',
    async execute(message, _args, db) {
        db.collection(settings.database.collections.helpEmbeds).find({
            commandName: this.name
        }).toArray(async (err, result) => {
            if (err) throw err;
            return await message.reply({
                embed: helpEmbed(message.member.displayHexColor, result[0])
            });
        });
    }
}