const chance = require('chance').Chance();
const fs = require('fs');

function generateDomains(count) {
    const topLevelDomains = ['com', 'edu', 'gov', 'org'];
    const domains = [];

    for (let i = 0; i < count; i++){
        const topLevelDomain = chance.pickone(topLevelDomains);
        domains.push(`${chance.word()}.${topLevelDomain}`);
    }

    return domains;
}

function generateEmails(domains, count) {
    const emails = [];

    for (let i = 0; i < count; i++) {
        const domain = chance.pickone(domains);
        emails.push(chance.email({domain}));
    }

    return emails;
}

function generateMessages(emails, count) {
    const messages = {};
    const pairs = [];
    let n = 0;

    for (let i = 0; i < emails.length - 1 && n < count; i++) {
        for (let j = i + 1; j < emails.length && n < count ; j++, n++) {
            pairs.push([i, j]);
            pairs.push([j, i]);
        }
    }

    chance.shuffle(pairs).forEach(pair => {
        messages[chance.word()] = {
            from: emails[pair[0]],
            to: emails[pair[1]]
        }
    });

    return messages;
}

function generateRules(domains, emails, messages, count) {
    const rules = [];

    // domain rules
    for (let i = 0; i < domains.length; i++) {
        const domain = chance.pickone(domains);
        rules.push({
            from: `*@${domain}`,
            action: `tag ${domain}`
        });
    }

    // personal folder rules
    for (let i = 0; i < emails.length; i++) {
        const email = chance.pickone(emails);

        rules.push({
            from: email,
            action: `from ${email}`
        });
    }

    // custom rules
    const workers = [
        () => {
            const from = chance.pickone(emails).replace(/[^@]+/, name => addStar(name));
            const action = `from ${from}`;
            return {from, action};
        },
        () => {
            const from = chance.pickone(emails).replace(/[^@]+/, name => addStar(addQuestion(name)));
            const action = `from ${from}`;
            return {from, action};
        },
        () => {
            const to = chance.pickone(emails).replace(/[^@]+/, name => addStar(name));
            const action = `to ${to}`;
            return {to, action};
        },
        () => {
            const to = chance.pickone(emails).replace(/[^@]+/, name => addStar(addQuestion(name)));
            const action = `to ${to}`;
            return {to, action};
        },
        () => {
            const message = chance.pickone(Object.values(messages));
            const from = message.from.replace(/[^@]+/, name => addStar(name));
            const to = message.to.replace(/[^@]+/, name => addStar(name));
            const action = `from ${from} to ${to}`;
            return {from, to, action};
        },
        () => {
            const message = chance.pickone(Object.values(messages));
            const from = message.from.replace(/[^@]+/, name => addStar(addQuestion(name)));
            const to = message.to.replace(/[^@]+/, name => addStar(addQuestion(name)));
            const action = `from ${from} to ${to}`;
            return {from, to, action};
        }
    ];

    for (let i = 0; i < emails.length; i++) {
        rules.push(chance.pickone(workers)());
    }

    return chance.pickset(chance.shuffle(rules), count);
}

function addStar(str) {
    return addWildcard(str, chance.integer({min: 1, max: str.length}), '*');
}

function addQuestion(str) {
    return addWildcard(str, 1, '?');
}

function addWildcard(str, charsToReplace, wildcard) {
    const start = chance.integer({min: 0, max: str.length - charsToReplace});
    const chars = str.split('');
    chars.splice(start, charsToReplace, wildcard);
    return chars.join('');
}

function errorHandler(err) {
    if (err)
        throw err;
}

const domains = generateDomains(10);
const emails = generateEmails(domains, 100);
const messages = generateMessages(emails, 10000);
const rules = generateRules(domains, emails, messages, 100);

fs.writeFile(__dirname + '/messages.json', JSON.stringify(messages, null, 4), errorHandler);
fs.writeFile(__dirname + '/rules.json', JSON.stringify(rules, null, 4), errorHandler);