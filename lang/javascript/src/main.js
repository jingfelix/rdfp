const { Command } = require('commander');
const fs = require('fs');
const program = new Command();

const { buildBF } = require('./build.js');
const logger = require('node-color-log');
const { BloomFilter } = require('bloom-filters');

const { Report } = require('./model.js');

program
    .name("fdfp-js")
    .version('0.0.1')
    .description('JS part of fdfp project');

program.command('build')
    .description('Build Bloom Filter with given data')
    .argument('<data>', 'JSON data to build Bloom Filter')
    // 添加一个类型为bool 的选项
    .option('-s, --split', 'Split data into TP and FP')
    .action((data, options) => {

        // read json data from file
        const json_data = JSON.parse(fs.readFileSync(data, 'utf-8'));
        buildBF(json_data, options.split);
    });


program.command('test')
    .description('Test Bloom Filter with given data')
    .argument('<data>', 'JSON data to test Bloom Filter')
    .argument('<filter>', 'Bloom Filter to test')
    .action((data, filter) => {
        logger.info(`Testing Bloom Filter with data: ${data} and filter: ${filter}`);

        // load filter from file
        const importedFilter = BloomFilter.fromJSON(JSON.parse(fs.readFileSync(filter, 'utf-8')));

        // load test data from file
        const testData = JSON.parse(fs.readFileSync(data, 'utf-8'));
        for (const test of testData) {
            const result = importedFilter.has(JSON.stringify(Report.toNode(test)));
            logger.info(`Result: ${result}`);
        }
    });

program.parse();
