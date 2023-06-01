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
const { v4: uuidv4 } = require('uuid');

const {
  setupConsoleLog
} = require('../lib/Utils');

const SmartContractData = require("../artifacts/CertificationC1.json");



// ---------------- INITIAL DATA ----------------
let ACCOUNTS;



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
  console.log(`--------- Scheduling a Tiny Bar Transaction ---------`);

  console.log('Sending 10 Hbars from account 1 to account 2')
  const txTinyBars = await HederaFunctions.transferHBars(
    ACCOUNTS.ACCOUNT_1.CLIENT, {
    amount: 10,
    fromAccount: ACCOUNTS.ACCOUNT_1.ID,
    toAccount: ACCOUNTS.ACCOUNT_2.ID,

  }, { skipFreeze: true, skipSigning: true });


  const scheduledTx = await HederaFunctions.createScheduledTransaction(
    ACCOUNTS.ACCOUNT_1.CLIENT, {
    transactionMemo: `Hossam scheduled transaction ${uuidv4()}`,
    transactionToSchedule: txTinyBars
  });
  const txBase64 = await HederaFunctions.converTransactionIntoBase64(
    ACCOUNTS.ACCOUNT_1.CLIENT, {
    transaction: scheduledTx
  });

  console.log(`The Base64 encoding of the scheduled transaction = ${txBase64}\n`);


  console.log('--- Decoding Tx from Base64, signging and submitting it ---')
  const scheduledTxReceipt = await HederaFunctions.signAndSubmitTransactionBase64(
    ACCOUNTS.ACCOUNT_1.CLIENT,
    txBase64,
    {
      signerAccounts: [ACCOUNTS.ACCOUNT_1]
    });


  console.log('The scheduled transaction is successfully submitted with status = ', scheduledTxReceipt.status);

  const scheduledTxQuerriedInfo = await HederaFunctions.queryScheduledTransaction(
    ACCOUNTS.ACCOUNT_1.CLIENT, {
    scheduleId: scheduledTxReceipt.scheduleId
  });

  // Printing the scheduled transaction info info
  HederaFunctions._printQueriedScheduledTx(scheduledTxQuerriedInfo);
}

