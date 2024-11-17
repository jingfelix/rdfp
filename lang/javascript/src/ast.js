const logger = require('./log.js');

const {
    visit,
} = require('ast-types');

const esprima = require('esprima');

function parseToAST(code) {
    return esprima.parseScript(code);
}

function ASTToArray(ast) {

    let nodes = [];

    visit(ast, {
        visitNode: function (path) {
            nodes.push(path.node);
            this.traverse(path);
        }
    });

    return nodes;
}

module.exports = { parseToAST, ASTToArray };