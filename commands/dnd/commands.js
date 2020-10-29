module.exports = {
    name: 'commands',
    args: false,
    description: 'List of all commands.',
    async execute(message, _args, dbClient) {
        await dbClient.connect();
        const dndDb = dbClient.db("dnd");
        
        dndDb.collection("helpEmbeds").find({
            commandName: this.name
        }).toArray(async (err, result) => {
            if (err) throw err;
            return await message.reply({
                embed: result[0],
            });
        });
    }
}