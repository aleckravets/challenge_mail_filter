function escapeRegExp(text) {
    return text.replace(/[-[\]{}()+.,\\^$|#\s]/g, '\\$&');
}

function isMatch(mail, mask) {
    if (mask === undefined) return true;

    var maskRegexp = escapeRegExp(mask)
        .replace('?', '.')
        .replace('*', '.*');

    // console.log(`${mask} => ${maskRegexp}`)

    return new RegExp(`^${maskRegexp}$`).test(mail);
}

module.exports = function(messages, rules) {
    const result = {};

    Object.keys(messages).forEach((key) => {
        const message = messages[key];
        result[key] = [];
        rules.forEach(rule => {
           if (isMatch(message.from, rule.from) && isMatch(message.to, rule.to))
               result[key].push(rule.action);
        });
    });

    return result;
};