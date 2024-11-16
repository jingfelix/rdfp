const { Command } = require('commander');
const program = new Command();

const { buildBF } = require('./build.js');

program
    .name("fdfp-js")
    .version('0.0.1')
    .description('JS part of fdfp project');

program.command('build')
    .description('Build Bloom Filter with given data')
    .argument('<data>', 'JSON data to build Bloom Filter')
    .action((data) => {
        // read json data from file
        const fs = require('fs');
        const dataPath = data;
        const json_data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        buildBF(json_data);
    });

program.parse();
