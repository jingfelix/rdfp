const logger = require('./log.js');

class Report {
    constructor(type, message, lines, tp) {
        this.type = type;
        this.message = message;
        this.lines = lines;
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
}

function buildBF(data) {

    let results = data.results;

    logger.info( 'Building Bloom Filter with data:', results.length);

    let reports = [];

    // 过滤所有非 js 类的报告
    for (const report of results) {

        let r = Report.fromSemgrep(report);
        if (r) {
            reports.push(r);
        }
    }

    for (const report of reports) {
        logger.debug(report.type)
    }

}

module.exports = { buildBF };