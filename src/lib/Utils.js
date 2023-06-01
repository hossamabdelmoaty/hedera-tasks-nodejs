/*
*
* ========== Util Functions ========
*
*/

const fs = require('fs');

exports.setupConsoleLog = async ({ resultsFilePath }) => {
    fs.writeFileSync(resultsFilePath, '');
    const log = console.log;
    console.log = (...data) => {
        log(data.join(' '));
        fs.appendFileSync(
            resultsFilePath,
            '\n' + data.join(' ')
        );
    }
}


exports.writeFileSync = (filePath, data) => {
    fs.writeFileSync(filePath, data);
}

exports.clearFile = (fileName) => {
    fs.writeFileSync(fileName, '');
}

exports.appendFileWithNewLine = (fileName) => {
    fs.appendFileSync(
        fileName,
        '\n'
    );
}

exports.appendFileWithData = (fileName, dataString, { newLine = true }) => {
    if (newLine) this.appendFileWithNewLine(fileName);
    fs.appendFileSync(
        fileName,
        '\n' + dataString.join(' ')
    );
}

exports.printAccountInfo = ({ ID, PUBLIC_KEY_DER_STRING, PRIVATE_KEY_DER_STRING }, { index, debug = false } = {}) => {
    const log = debug ? console.debug : console.log;
    log(
        `Account (${index}):\n`,
        `--- Account ID: ${ID}\n`,
        `--- Public Key:" ${PUBLIC_KEY_DER_STRING}\n`,
        `--- Private Key: ${PRIVATE_KEY_DER_STRING}`
    );
}
