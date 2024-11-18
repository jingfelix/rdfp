const logger = require('./log.js');
const { BloomFilter } = require('bloom-filters');
const { Report } = require('./model.js');
const fs = require('fs');

const errRate = 0.01;

function buildBF(data, split) {

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

    function getRandomSubset(arr, percentage) {
        const shuffled = arr.sort(() => 0.5 - Math.random());
        const subsetSize = Math.floor(arr.length * percentage);
        return shuffled.splice(0, subsetSize); // 使用 splice 确保原数组不包含测试集数据
    }

    // 分别随机选择 TP 和 FP 中的 10% 作为测试集
    if (split) {
        const tpTest = getRandomSubset(tpReports, 0.1);
        const fpTest = getRandomSubset(fpReports, 0.1);
    
        logger.info('TP Test:', tpTest.length);
        logger.info('FP Test:', fpTest.length);

        // 保存测试集到文件
        fs.writeFileSync('tpTest.json', JSON.stringify(tpTest, null, 2));
        fs.writeFileSync('fpTest.json', JSON.stringify(fpTest, null, 2));
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

    // Save filters to file
    const tpFilterData = tpFilter.saveAsJSON();
    const fpFilterData = fpFilter.saveAsJSON();

    fs.writeFileSync('tpFilter.json', JSON.stringify(tpFilterData, null, 2));
    fs.writeFileSync('fpFilter.json', JSON.stringify(fpFilterData, null, 2));
}

module.exports = { buildBF };