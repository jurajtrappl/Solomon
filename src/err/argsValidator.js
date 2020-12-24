const { ArgsCountError, InvalidArgTypeError } = require("./errors");
const { isRollExpression } = require("../rolls/dice");

const type = {
    numeric: typeof 42,
    rollExpression: 'rollExpression',
    string: typeof 'String'
};

class ArgsValidator {
    static CheckCount(args, requiredCount) {
        if (args.length != requiredCount) {
            throw new ArgsCountError(args.length, requiredCount);
        }
    }

    static TypeCheckAll(args, expectedTypes) {
        //zip
        args.map((arg, index) => {
            this.TypeCheckOne(arg, expectedTypes[index]);
        });
    }

    static TypeCheckOne(arg, expectedType) {
        if (expectedType == type.numeric) {
            if (isNaN(arg)) {
                throw new InvalidArgTypeError(arg, expectedType);
            }
        } else if (expectedType == type.rollExpression) {
            if (!isRollExpression(arg)) {
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