const fs = require('fs');

function jsonReader(filePath, cb) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return cb && cb(err)
        }
        try {
            const object = JSON.parse(data)
            return cb && cb(null, object)
        } catch (err) {
            return cb && cb(err)
        }
    })
}

function jsonWriter(filePath, file) {
    fs.writeFile(filePath, JSON.stringify(file), (err) => {
        if (err) console.log('Error writing file:', err)
    });
}

module.exports = { jsonReader, jsonWriter }