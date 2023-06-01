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
  CustomRoyaltyFee,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  TokenId,
  Hbar,
  CustomFixedFee
} = require("@hashgraph/sdk");

const {
  setupConsoleLog
} = require('../lib/Utils');




// ---------------- INITIAL DATA ----------------
let ACCOUNTS;

const TOKEN_DETAILS = {
  NAME: 'Hossam Token',
  SYMBOL: 'HOSS',
  TOKEN_TYPE: HederaFunctions.CONSTANTS.TOKENS.TYPES.FUNGIBLE,
  INITIAL_SUPPLY: 350.50,
  SUPPLY_TYPE: HederaFunctions.CONSTANTS.TOKENS.SUPPLY.TYPES.FINITE,
  MAX_SUPPLY: 500
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
  const client = ACCOUNTS.ACCOUNT_1.CLIENT;

  console.log('-----Creating the new token-----');
  const nftCustomFee = new CustomRoyaltyFee()
    .setNumerator(1)
    .setDenominator(10)
    .setFeeCollectorAccountId(ACCOUNTS.ACCOUNT_2.ID)
    .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(200)));

  const tokenCreationTx = new TokenCreateTransaction()
    .setTokenName('Hossam Hedera Exam Token')
    .setTokenSymbol('HOSSAMEXAM')
    .setTokenType(TokenType.NonFungibleUnique)
    .setTreasuryAccountId(ACCOUNTS.ACCOUNT_1.ID)
    .setInitialSupply(0)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(5)
    .setCustomFees([nftCustomFee])
    .setMaxTransactionFee(new Hbar(50))
    .setAdminKey(ACCOUNTS.ACCOUNT_1.PUBLIC_KEY)
    .setSupplyKey(ACCOUNTS.ACCOUNT_1.PUBLIC_KEY)
    .freezeWith(client);

  const tokenCreationSignTx = await tokenCreationTx.sign(ACCOUNTS.ACCOUNT_1.PRIVATE_KEY);
  const tokenCreationTxResponse = await tokenCreationSignTx.execute(client);
  const tokenCreationTxReceipt = await tokenCreationTxResponse.getReceipt(client);
  const tokenId = tokenCreationTxReceipt.tokenId;
  console.log('The new token ID is ' + tokenId + '\n');

  console.log('----- Minting-----')
  const mintingTx = new TokenMintTransaction()
    .setTokenId(tokenId)
    .setMetadata([
      Buffer.from('NFT 1'),
      Buffer.from('NFT 2'),
      Buffer.from('NFT 3'),
      Buffer.from('NFT 4'),
      Buffer.from('NFT 5'),
    ])
    .freezeWith(client);
  const mintintTxSigned = await mintingTx.sign(ACCOUNTS.ACCOUNT_1.PRIVATE_KEY);
  const mintingTxResponse = await mintintTxSigned.execute(client);
  const mintingTxReceipt = await mintingTxResponse.getReceipt(client);
  console.log('The status of the minting transaction ', mintingTxReceipt.status);


  console.log('-----Token Association-----');
  const associateBuyerTx = await new TokenAssociateTransaction()
    .setAccountId(ACCOUNTS.ACCOUNT_3.ID)
    .setTokenIds([tokenId])
    .freezeWith(client)
    .sign(ACCOUNTS.ACCOUNT_3.PRIVATE_KEY);
  const associateBuyerTxSubmit = await associateBuyerTx.execute(client);
  const associateBuyerRx = await associateBuyerTxSubmit.getReceipt(client);
  console.log(`The status of the Token association with Account 3 is ${associateBuyerRx.status} \n`);


  console.log(`Account 1 ID = ${ACCOUNTS.ACCOUNT_1.ID} balance = ${await HederaFunctions.queryBalance(client, ACCOUNTS.ACCOUNT_1.ID, tokenId)}`);


  try {
    const transferTx = new TransferTransaction()
      .addNftTransfer(
        TokenId.fromString(tokenId),
        2,
        ACCOUNTS.ACCOUNT_1.ID,
        ACCOUNTS.ACCOUNT_3.ID
      )
      .freezeWith(client);

    const transferTxSigned = await (await transferTx.sign(ACCOUNTS.ACCOUNT_1.PRIVATE_KEY)).sign(ACCOUNTS.ACCOUNT_3.PRIVATE_KEY);
    const transferTxResponse = await transferTxSigned.execute(client);
    const transferTxReceipt = await transferTxResponse.getReceipt(client);
    console.log('The transfer transaction receipt status ', transferTxReceipt.status);
  } catch (err) {
    console.log('X X X X X X Error in token transfer: ' + err);
  }

  console.log(`Account 1 ID = ${ACCOUNTS.ACCOUNT_1.ID} balance = ${await HederaFunctions.queryBalance(client, ACCOUNTS.ACCOUNT_1.ID, tokenId)}`);
  console.log(`Account 3 ID =  ${ACCOUNTS.ACCOUNT_3.ID} balance = ${await HederaFunctions.queryBalance(client, ACCOUNTS.ACCOUNT_3.ID, tokenId)}`);

}

