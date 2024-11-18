const { parseToAST, ASTToArray } = require('./ast.js');
const logger = require('./log.js');

class Report {
    constructor(type, message, lines, tp) {
        this.type = type;
        this.message = message;
        this.lines = lines.trim().startsWith('return ') ? lines.trim().substring(7) : lines;
        this.tp = tp;
    }

    static fromSemgrep(data) {
        if (!data.check_id.startsWith('javascript.')) {
            return null;
        }

        return new Report(
            data.check_id,
            data.extra.message,
            data.extra.lines,
            data.TP
        )
    }

    static toNode(report) {
        try {
            let ast = parseToAST(report.lines);
            let nodes = ASTToArray(ast);
            return nodes;
        } catch (error) {
            logger.warn('Error parsing AST:', error);
            return null;
        }
    }

    static toNodeArray(reports) {
        let nodeArray = [];
        for (const report of reports) {
            let nodes = Report.toNode(report);
            if (nodes) {
                nodeArray.push(nodes);
            }
        }

        logger.debug('AST Nodes:', nodeArray.length);

        return nodeArray;
    }

}

module.exports = { Report };