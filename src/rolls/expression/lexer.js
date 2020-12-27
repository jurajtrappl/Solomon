const Lexer = require('lex');

const rollExpressionLexer = new Lexer;

rollExpressionLexer.addRule(/\s+/, lexeme => {
    /* skip whitespace */
});

rollExpressionLexer.addRule(/[0-9]+d(4|6|8|10|12|20)/, lexeme => {
    return lexeme;  /* dice */
});

rollExpressionLexer.addRule(/[\+\-]/, lexeme => {
    return lexeme;  /* operators */
});

rollExpressionLexer.addRule(/[0-9]+/, lexeme => {
    return lexeme;  /* bonus */
})

module.exports = {
    rollExpressionLexer
}