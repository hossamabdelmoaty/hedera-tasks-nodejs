/*
*
* ========== TASK (1) - Adding New Accounts ========
*
* :::: NOTES :::::
*
* - Accounts are in the folder "src/accounts" 
* - Output data files are in the folder "src/results"
*
*/

// ---------------- TASK NAME  ----------------
const TASK_NAME = require('path').basename(__filename).split('.js')[0];



// ---------------- IMPORTS ----------------
const HederaFunctions = require('../lib/HederaFunctions');
const { ContractFunctionParameters } = require("@hashgraph/sdk");
const { hethers } = require("@hashgraph/hethers");
const abicoder = new hethers.utils.AbiCoder();

const {
  setupConsoleLog
} = require('../lib/Utils');

const SmartContractData = require("../artifacts/CertificationC1.json");



// ---------------- INITIAL DATA ----------------
let ACCOUNTS;

const SMART_CONTRACT = {
  DEPLOYMENT: {
    GAS: 100000
  },
  EXECUTION: {
    GAS: 100000
  }
};



// ---------------- MAIN ----------------
async function main() {
  setupConsoleLog({ resultsFilePath: `src/results/${TASK_NAME}_results.txt` });
  console.log(`######---------------- ${TASK_NAME} ----------------######`);
  ACCOUNTS = await HederaFunctions.getAccounts();
  await applyTask();
}
main().then(() => process.exit()).catch(err => { console.error(err); process.exit() });





// ---------------- TASK ----------------
async function applyTask() {
  console.log(`--------- Consensus ---------`);
  const topicReceipt = await HederaFunctions.createTopic(ACCOUNTS.ACCOUNT_1.CLIENT);
  console.log('Topic has been created with Topic ID = ', topicReceipt.topicId)

  console.log('Setting Timeout with 5 seconds')
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log('Timeout is over');

  const message = new Date().toISOString();
  const msgReceipt = await HederaFunctions.submitMessageToTopic(
    ACCOUNTS.ACCOUNT_1.CLIENT, {
    topicId: topicReceipt.topicId,
    message
  });
  console.log(`
  Message has been successfully submited to topic
  --- Topic ID = ${topicReceipt.topicId}
  --- Message = ${message}
  --- Message Submission Status = ${msgReceipt.status}  
  `);
}

