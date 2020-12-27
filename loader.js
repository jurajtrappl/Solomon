const { readdirSync } = require('fs');
const { Collection } = require('discord.js');

/**
 * Static class that loads source files from specified directories
 * to a discord sourceFileCollection
 * 
 * @class SourceFileLoader
 */
class SourceFileLoader {
    constructor() {
        if (this instanceof SourceFileLoader) {
            throw Error('A static class can not be instantiated.');
        }
    }

    static load = (directories) => {
        const sourceFileCollection = new Collection();
        for (let dir of directories) {
            let sourceFiles = readdirSync(dir).filter(file => file.endsWith('.js'));
            sourceFiles.forEach(file => {
                const sourceFile = require(`${dir}/${file}`);
                sourceFileCollection.set(sourceFile.name, sourceFile);
            })
        }
        return sourceFileCollection;
    }
}

module.exports = {
    SourceFileLoader
}