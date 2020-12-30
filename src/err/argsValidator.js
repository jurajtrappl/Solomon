const { ArgsCountError, InvalidArgTypeError } = require("./errors");

const type = {
    numeric: typeof 42,
    string: typeof 'String'
};

class ArgsValidator {
    static checkCount = (args, requiredCount) => {
        if (args.length != requiredCount) {
            throw new ArgsCountError(args.length, requiredCount);
        }
    }

    static checkCountAtleast = (args, requiredCount) => {
        if (args.length < requiredCount) {
            throw new ArgsCountError(args.length, requiredCount);
        }
    }

    static typeCheckAll = (args, expectedTypes) => {
        //zip
        args.map((arg, index) => {
            this.typeCheckOne(arg, expectedTypes[index]);
        });
    }

    static typeCheckOne = (arg, expectedType) => {
        if (expectedType == type.numeric) {
            if (isNaN(arg)) {
                throw new InvalidArgTypeError(arg, expectedType);
            }
        } else {
            if (typeof arg != expectedType) {
                throw new InvalidArgTypeError(arg, expectedType);
            }
        }
    }
}

module.exports = {
    ArgsValidator,
    type
}