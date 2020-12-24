const { connectionString } = require('../../auth.json');
const { database } = require('../../settings.json');
const { MongoClient } = require('mongodb');

let instance;

class MongoServices {
    constructor() {}

    async connect() {
        try {
            if (!instance) {
                const client = new MongoClient(connectionString, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
                instance = await client.connect();
                console.log('Database connected!');
                return true;
            }
            return false;
        } catch ({ message }) {
            throw new Error(message);
        }
    }

    async disconnect() {
        try {
            if (instance) await instance.close();
            return true;
        } catch ({ message }) {
            throw new Error(message);
        }
    }

    async tryFind(collectionName, query) {
        let result = await this.find(collectionName, query);
        return (result === undefined || result.length == 0) ? undefined : result[0];
    }

    find(collectionName, query) {
        return instance
            .db(database.name)
            .collection(collectionName)
            .find(query)
            .toArray();
    }

    updateOne(collectionName, query, newValue) {
        return instance
            .db(database.name)
            .collection(collectionName)
            .updateOne(query, newValue);
    }

    findAll(collectionName) {
        return instance
            .db(database.name)
            .collection(collectionName)
            .find()
            .toArray();
    }

    updateAll(collectionName, newValue) {
        return instance
            .db(database.name)
            .collection(collectionName)
            .updateMany({}, newValue, { multi: true });
    } 
}

module.exports = { MongoServices };