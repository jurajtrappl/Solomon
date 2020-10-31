const {
    MongoClient
} = require('mongodb');

class Database {
    constructor(connectionString) {
        //set up mongo db client
        this.dbClient = new MongoClient(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        this.dbClient.connect();
    }

    dndDb() {
        return this.dbClient.db("dnd");
    }
}

module.exports = { Database }