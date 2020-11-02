module.exports = {
    name: 'commands',
    args: false,
    description: 'List of all commands.',
    async execute(message, _args, db) {
        db.collection("helpEmbeds").find({
            commandName: this.name
        }).toArray(async (err, result) => {
            if (err) throw err;
            return await message.reply({
                embed: result[0],
            });
        });
    }
}