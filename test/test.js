const assert = require('assert');
const chai = require('chai');
const filter = require('../filter');

chai.should();

var messages = {
    msg1: {from: 'jack@example.com', to: 'jill@example.org'},
    msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
    msg3: {from: 'boss@work.com', to: 'jack@example.com'}
};

var rules = [
    {from: '*@work.com', action: 'tag work'},
    {from: '*@spam.com', action: 'tag spam'},
    {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
    {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
];

var expectedResult = {
    msg1: ['folder jack', 'forward to jill@elsewhere.com'],
    msg2: ['tag spam', 'forward to jill@elsewhere.com'],
    msg3: ['tag work']
};

describe('Mail filter', function() {
   it('Correctness', function() {
       assert.deepStrictEqual(filter(messages, rules), expectedResult);
   });

    it('Speed', function() {
        (function() {
            const messages = require('./data/messages');
            const rules = require('./data/rules');
            const result = filter(messages, rules);
            console.log(result);
        }).should.not.throw();
    });
});


