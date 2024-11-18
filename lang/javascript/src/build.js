const logger = require('./log.js');
const { parseToAST, ASTToArray } = require('./ast.js');
const { BloomFilter } = require('bloom-filters');


const errRate = 0.01;

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

    let tpReports = [];
    let fpReports = [];

    // 过滤所有非 js 类的报告
    for (const report of results) {

        let r = Report.fromSemgrep(report);
        if (r) {
            if (r.tp == '1') {
                tpReports.push(r);
            } else {
                fpReports.push(r);
            }
        }
    }

    const tpNodeArray = Report.toNodeArray(tpReports);
    const fpNodeArray = Report.toNodeArray(fpReports);

    logger.info('TP Reports:', tpNodeArray.length);
    logger.info('FP Reports:', fpNodeArray.length);

    const toStringArray = (nodeArray) => {
        let strArray = [];
        for (const nodes of nodeArray) {
            let str = JSON.stringify(nodes);
            strArray.push(str);
        }
        return strArray;
    }

    let tpFilter = BloomFilter.from(toStringArray(tpNodeArray), errRate);
    let fpFilter = BloomFilter.from(toStringArray(fpNodeArray), errRate);

    // // TEST
    // for (const nodes of fpNodeArray) {
    //     logger.debug('Filter TEST:', tpFilter.has(JSON.stringify(nodes)), fpFilter.has(JSON.stringify(nodes)));
    // }

}

module.exports = { buildBF };