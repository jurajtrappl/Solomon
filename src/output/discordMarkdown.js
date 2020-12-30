const bold = (text) => `**${text}**`;
const italic = (text) => `*${text}*`;
const underline = (text) => `__${text}__`;
const strikeThrough = (text) => `~~${text}~~`;

const singleLineCodeBlock = (text) => `\`${text}\``;
const multiLineCodeBlock = (text) => `\`\`\`${text}\`\`\``;

const singleLineBlockQuote = (text) => `\>${text}`;
const multiLineBlockQuote = (text) => `\>\>\>${text}`;

module.exports = {
    bold,
    italic,
    underline,
    strikeThrough,
    singleLineBlockQuote,
    multiLineBlockQuote,
    singleLineCodeBlock,
    multiLineCodeBlock
}