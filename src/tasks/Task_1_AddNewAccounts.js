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
  setupConsoleLog,
  printAccountInfo,
  writeFileSync
} = require('../lib/Utils');




// ---------------- INITIAL DATA ----------------
const ACCOUNTS_JSON_FILE = 'src/accounts/Accounts.json';


const MAIN_ACCOUNT = require('../accounts/MainAccount.json');
const NUM_OF_ACCOUNTS_TO_CREATE = 5;
const INITIAL_BALANCE_PER_ACCOUNT = 1000;





// ---------------- MAIN ----------------
async function main() {
  setupConsoleLog({ resultsFilePath: `src/results/${TASK_NAME}_results.txt` });
  console.log(`######---------------- ${TASK_NAME} ----------------######`);
  await applyTask();
}
main().then(() => process.exit()).catch(err => { console.error(err); process.exit() });



// ---------------- TASK ----------------
async function applyTask() {
  if (!MAIN_ACCOUNT.ID || !MAIN_ACCOUNT.PRIVATE_KEY) {
    throw new Error(
      "Either main account ID and Private key must be provided."
    );
  }
  console.log(`Total number of accounts to create: ${NUM_OF_ACCOUNTS_TO_CREATE}`);


  const accounts = {};
  const client = await HederaFunctions.getClient(MAIN_ACCOUNT.ID, MAIN_ACCOUNT.PRIVATE_KEY);

  for (let index = 1; index < NUM_OF_ACCOUNTS_TO_CREATE + 1; index++) {
    const newAccountData = await HederaFunctions.createAccount(client, { initialBalance: INITIAL_BALANCE_PER_ACCOUNT });
    accounts[`ACCOUNT_${index}`] = newAccountData;
    printAccountInfo(newAccountData, { index });
  }

  writeFileSync(ACCOUNTS_JSON_FILE, JSON.stringify(accounts, null, 2));
}

