const logger = require('./log.js');
const { parseToAST, ASTToArray } = require('./ast.js');

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

    static toNodeArray(reports) {
        let nodeArray = [];
        for (const report of reports) {
            try {
                let ast = parseToAST(report.lines);
                let nodes = ASTToArray(ast);
                nodeArray.push(nodes);
            } catch (error) {
                continue;
            }
        }

        logger.debug('AST Nodes:', nodeArray.length);

        return nodeArray;
    }

}

function buildBF(data) {

    let results = data.results;

    logger.info('Building Bloom Filter with data:', results.length);

    let tp_reports = [];
    let fp_reports = [];

    // 过滤所有非 js 类的报告
    for (const report of results) {

        let r = Report.fromSemgrep(report);
        if (r) {
            if (r.tp == '1') {
                tp_reports.push(r);
            } else {
                fp_reports.push(r);
            }
        }
    }

    logger.info('TP Reports:', Report.toNodeArray(tp_reports).length);
    logger.info('FP Reports:', Report.toNodeArray(fp_reports).length);

}

module.exports = { buildBF };