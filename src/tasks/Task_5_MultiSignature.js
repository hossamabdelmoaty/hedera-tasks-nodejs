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
const {
  KeyList,
  AccountCreateTransaction,
  Hbar,
  TransferTransaction
} = require("@hashgraph/sdk");


const {
  setupConsoleLog
} = require('../lib/Utils');




// ---------------- INITIAL DATA ----------------
let ACCOUNTS;
const MAIN_ACCOUNT = require('../accounts/MainAccount.json');



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
  const client = ACCOUNTS.ACCOUNT_1.CLIENT;

  const keys = [
    ACCOUNTS.ACCOUNT_1.PUBLIC_KEY,
    ACCOUNTS.ACCOUNT_2.PUBLIC_KEY,
    ACCOUNTS.ACCOUNT_3.PUBLIC_KEY,
  ];

  const keyList = new KeyList(keys, 2);
  const multiSigAccount = await new AccountCreateTransaction()
    .setKey(keyList)
    .setInitialBalance(Hbar.fromString("20"))
    .execute(client);

  const getReceipt = await multiSigAccount.getReceipt(client);
  const multiSignAcctId = getReceipt.accountId;

  console.log("\nThe Multi Signature Account ID is: " + multiSignAcctId);


  try {
    const tx1 = await new TransferTransaction()
      .addHbarTransfer(multiSignAcctId, new Hbar(-10))
      .addHbarTransfer(ACCOUNTS.ACCOUNT_4.ID, new Hbar(10))
      .freezeWith(client)
      .sign(ACCOUNTS.ACCOUNT_1.PRIVATE_KEY);

    const tx1Response = await tx1.execute(client);
    const tx1Receipt = await tx1Response.getReceipt(client);
    console.log(
      `X X X X X X X X Creating and executing transaction ${tx1Response.transactionId.toString()} status: ${tx1Receipt.status
      }`
    );
  } catch (err) {
    console.log('EXPECTED to fail: The transaction has failed');
  }


  const tx2 = new TransferTransaction()
    .addHbarTransfer(multiSignAcctId, new Hbar(-10))
    .addHbarTransfer(ACCOUNTS.ACCOUNT_4.ID, new Hbar(10))
    .freezeWith(client);

  const tx2Signed = await (await tx2.sign(ACCOUNTS.ACCOUNT_1.PRIVATE_KEY)).sign(ACCOUNTS.ACCOUNT_2.PRIVATE_KEY);

  const tx2Response = await tx2Signed.execute(client);
  const tx2Receipt = await tx2Response.getReceipt(client);
  console.log(
    `Creating and executing transaction ${tx2Response.transactionId.toString()} status: ${tx2Receipt.status
    }`);
}


