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
  console.log(`--------- Deploying the smart contract ---------`);
  const smartContractDeploymentReceipt = await HederaFunctions.deploySmartContract(ACCOUNTS.ACCOUNT_1.CLIENT, {
    adminPrivateKey: ACCOUNTS.ACCOUNT_1.PRIVATE_KEY,
    gas: SMART_CONTRACT.DEPLOYMENT.GAS,
    bytecode: SmartContractData.bytecode
  });
  console.log(`The deployed smart contract id = ${smartContractDeploymentReceipt.contractId}`);


  console.log(`--------- Executing the smart contract ---------`);
  const record1 = await HederaFunctions.executeSmartContract(ACCOUNTS.ACCOUNT_1.CLIENT, {
    contractId: smartContractDeploymentReceipt.contractId,
    gas: SMART_CONTRACT.EXECUTION.GAS,
    functionName: SmartContractData.abi[1].name,
    functionToExecute: new ContractFunctionParameters().addUint16(4).addUint16(3)
  });

  const result_1 = abicoder.decode(["uint16"], "0x" + record1.contractFunctionResult.bytes.toString("hex"));
  console.log(`First result from function ${SmartContractData.abi[1].name} = ${result_1}`);

  const record2 = await HederaFunctions.executeSmartContract(ACCOUNTS.ACCOUNT_1.CLIENT, {
    contractId: smartContractDeploymentReceipt.contractId,
    gas: SMART_CONTRACT.EXECUTION.GAS,
    functionName: SmartContractData.abi[2].name,
    functionToExecute: new ContractFunctionParameters().addUint16(result_1[0])
  });

  const result_2 = abicoder.decode(["uint16"], "0x" + record2.contractFunctionResult.bytes.toString("hex"));
  console.log(`First result from function ${SmartContractData.abi[1].name} = ${result_2}`);
}

