/*
*
* ========== Hedera Helper Functions ========
*
*/

const {
    hethers
} = require("@hashgraph/hethers");

const {
    Client,
    AccountCreateTransaction,
    Hbar,
    Wallet,
    PrivateKey,
    TokenCreateTransaction,
    TokenAssociateTransaction,
    TokenType,
    TokenSupplyType,
    TransferTransaction,
    TokenPauseTransaction,
    TokenUnpauseTransaction,
    ContractCreateFlow,
    ContractExecuteTransaction,
    ScheduleCreateTransaction,
    ScheduleInfoQuery,
    Timestamp,
    Transaction,
    ScheduleSignTransaction,
    AccountAllowanceApproveTransaction,
    AccountId,
    TopicCreateTransaction,
    TransactionId,
    TopicMessageSubmitTransaction,
    AccountBalanceQuery
} = require("@hashgraph/sdk");
const Account = require('./AccountClass');


exports.CONSTANTS = {
    TOKENS: {
        TYPES: {
            FUNGIBLE: 'fungible',
            NON_FUNGIBLE: 'nonFungible'
        },
        SUPPLY: {
            TYPES: {
                FINITE: 'finite'
            }
        }
    }
};

exports.getClient = async (accountId, privateKey) => {
    const client = Client.forTestnet();
    client.setOperator(accountId, privateKey);
    return client;
}



exports.createAccount = async (client, {
    returnAll = false,
    initialBalance
} = {}) => {
    const privateKey = PrivateKey.generateED25519();
    const publicKey = privateKey.publicKey;
    const account = await new AccountCreateTransaction()
        .setKey(publicKey)
        .setInitialBalance(new Hbar(initialBalance))
        .execute(client);

    const receipt = await account.getReceipt(client);
    const accountId = receipt.accountId;

    const extraData = {
        account,
        receipt,
    };

    return {
        ID: accountId.toString(),
        PRIVATE_KEY_DER_STRING: privateKey.toStringDer(),
        PUBLIC_KEY_DER_STRING: publicKey.toStringDer(),
        ...(returnAll ? extraData : {})
    }
}

exports.generatePrivateKey = () => {
    return PrivateKey.generate();
}

exports.getWallet = (accountId, accountPrivateKey) => {
    return new Wallet(accountId, accountPrivateKey);
}

exports.getAccounts = async () => {
    const accountsData = require('../accounts/Accounts.json');
    const accounts = {};


    Object.entries(accountsData).map(async ([accName, acc]) => {
        accounts[accName] = new Account({
            ID: acc.ID,
            PRIVATE_KEY_DER_STRING: acc.PRIVATE_KEY_DER_STRING,
            PUBLIC_KEY_DER_STRING: acc.PUBLIC_KEY_DER_STRING
        });
    });

    return accounts;
}

exports.createToken = async (client, {
    tokenName,
    tokenSymbol,
    tokenType,
    treasuryAccountId,
    initialSupply,
    supplyType,
    maxSupply,
    pauseKey,
    adminKey,
    signingKey
}) => {
    const tokenTransaction =
        new TokenCreateTransaction()
            .setTokenName(tokenName)
            .setTokenSymbol(tokenSymbol)
            .setTokenType(this._getTokenType(tokenType))
            .setTreasuryAccountId(treasuryAccountId)
            .setInitialSupply(initialSupply)
            .setSupplyType(this._getSupplyType(supplyType))
            .setMaxSupply(maxSupply)
            .setPauseKey(pauseKey)
            .setAdminKey(adminKey)
            .freezeWith(client);

    const signTx = await tokenTransaction.sign(signingKey);
    const txResponse = await signTx.execute(client);
    return await txResponse.getReceipt(client);
}

exports.associateToken = async (client, { account, signingKey, tokenIds }) => {
    const associateTx =
        await new TokenAssociateTransaction()
            .setAccountId(account)
            .setTokenIds(tokenIds)
            .freezeWith(client)
            .sign(signingKey);
    const assocSubmission = await associateTx.execute(client);
    return await assocSubmission.getReceipt(client);
}

exports.transferTokens = async (client, { fromAccount, toAccount, tokenId, amount, signingKey }) => {
    const tx = new TransferTransaction()
        .addTokenTransfer(tokenId, fromAccount, -1 * amount)
        .addTokenTransfer(tokenId, toAccount, amount)
        .freezeWith(client);
    const signTx = await tx.sign(signingKey);
    const txResponse = await signTx.execute(client);
    return await txResponse.getReceipt(client);
}

exports.transferTinyBars = async (client, { fromAccount, toAccount, tokenId, amount, signingKey }, { skipFreeze = false, skipSigning = false } = {}) => {
    const tx = new TransferTransaction()
        .addHbarTransfer(fromAccount, Hbar.fromTinybars(-1 * amount))
        .addHbarTransfer(toAccount, Hbar.fromTinybars(amount));

    if (!skipFreeze) tx = tx.freezeWith(client);
    if (!skipSigning) {
        const signTx = await tx.sign(signingKey);
        const txResponse = await signTx.execute(client);
        return await txResponse.getReceipt(client);
    }
    return tx;
}

exports.transferHBars = async (client, { fromAccount, toAccount, tokenId, amount, signingKey }, { skipFreeze = false, skipSigning = false } = {}) => {
    const tx = new TransferTransaction()
        .addHbarTransfer(fromAccount, new Hbar(-1 * amount))
        .addHbarTransfer(toAccount, new Hbar(amount));

    if (!skipFreeze) tx = tx.freezeWith(client);
    if (!skipSigning) {
        const signTx = await tx.sign(signingKey);
        const txResponse = await signTx.execute(client);
        return await txResponse.getReceipt(client);
    }
    return tx;
}

exports.pauseToken = async (client, { tokenId, pauseKey }) => {
    const pauseTransaction =
        new TokenPauseTransaction()
            .setTokenId(tokenId)
            .freezeWith(client);

    const tx = await pauseTransaction.sign(pauseKey);
    const response = await tx.execute(client);
    return await response.getReceipt(client);
}

exports.unpauseToken = async (client, { tokenId, pauseKey }) => {
    const pauseTransaction =
        new TokenUnpauseTransaction()
            .setTokenId(tokenId)
            .freezeWith(client);

    const tx = await pauseTransaction.sign(pauseKey);
    const response = await tx.execute(client);
    return await response.getReceipt(client);
}

exports.deploySmartContract = async (client, { bytecode, gas, adminPrivateKey }) => {
    const tx = new ContractCreateFlow()
        .setGas(gas)
        .setBytecode(bytecode)
        .setAdminKey(adminPrivateKey);
    const txResponse = await tx.execute(client);
    return await txResponse.getReceipt(client);
}

exports.executeSmartContract = async (client, { contractId, gas, functionName, functionToExecute }) => {
    const tx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(gas)
        .setFunction(
            functionName,
            functionToExecute //Example: new ContractFunctionParameters().addUint16(3).addUint16(2)
        );

    const txResponse = await tx.execute(client);
    return await txResponse.getRecord(client);
}

exports.createScheduledTransaction = async (client, { transactionMemo, transactionToSchedule }, { skipExecution = false } = {}) => {
    return new ScheduleCreateTransaction()
        .setScheduleMemo(transactionMemo)
        .setScheduledTransaction(transactionToSchedule);
}

// exports.signAndSubmitScheduledTransaction = async (client, { scheduleId, signerPrivateKey }) => {
//     const signedTx = await new ScheduleSignTransaction()
//         .setScheduleId(scheduleId)
//         .freezeWith(client)
//         .sign(signerPrivateKey);

//     const txResponse = await signedTx.execute(client);
//     const receipt = await txResponse.getReceipt(client);
//     return receipt;
// }

exports.converTransactionIntoBase64 = async (client, { transaction }) => {
    const txBytes = (await transaction.setNodeAccountIds([new AccountId(3)]).freezeWith(client)).toBytes();
    return Buffer.from(txBytes).toString('base64');
}

exports.signAndSubmitTransactionBase64 = async (client, transactionbase64, { signerAccounts }) => {
    const txBytes = Buffer.from(transactionbase64, 'base64');
    const transaction =
        Transaction.fromBytes(txBytes)
            .freezeWith(client);


    const signedTransaction = this.addMultipleSignaturesToTransaction(transaction, signerAccounts);

    const txResponse = await signedTransaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    return receipt;
}

exports.addMultipleSignaturesToTransaction = (transaction, accounts) => {
    accounts.map(acc => {
        const signature = acc.PRIVATE_KEY.signTransaction(transaction);
        transaction.addSignature(acc.PUBLIC_KEY, signature);
    });
    return transaction;
}
exports.queryBalance = async (client, user, tokenId) => {
    const balanceQuery = new AccountBalanceQuery().setAccountId(user);
    const tokenBalance = await balanceQuery.execute(client);
    return tokenBalance.toJSON().tokens.find(token => tokenId === tokenId).balance;
};

exports.queryScheduledTransaction = async (client, { scheduleId }) => {
    const query = new ScheduleInfoQuery()
        .setScheduleId(scheduleId);
    return await query.execute(client);
}

exports._printQueriedScheduledTx = (scheduledTxQuerriedInfo, { debug = false } = {}) => {
    const log = debug ? console.debug : console.log;

    log('Queried Scheduled Transaction')
    log("--- Schedule Id = ", scheduledTxQuerriedInfo.scheduleId);
    log("--- Schedule Memo = ", scheduledTxQuerriedInfo.scheduleMemo);
    log("--- Creator Account Id = ", scheduledTxQuerriedInfo.creatorAccountId);
    log("--- Payer Account Id = ", scheduledTxQuerriedInfo.payerAccountId);
    log("--- Expiration Time = ", new Timestamp(scheduledTxQuerriedInfo.expirationTime).toDate());
    log("--- Execution Time = ", new Timestamp(scheduledTxQuerriedInfo.executed).toDate());
    log('\n');
}

exports.createAllowanceApproveTransaction = async ({ ownerAccount, spenderAccount, amount }) => {
    // const transaction = new AccountAllowanceApproveTransaction()
    //     .approveHbarAllowance(ownerAccount.ID, spenderAccount.ID, Hbar.from(amount))
    //     .freezeWithSigner(ownerAccount.WALLET);

    // const signTx = await transaction.sign(ownerAccount.PRIVATE_KEY);
    // const txResponse = await signTx.execute(client);
    // return await txResponse.getReceipt(client);

    const signerPrivateKey = ownerAccount.PRIVATE_KEY;
    const singerWallet = ownerAccount.WALLET;
    return await (
        await (
            await (
                await (
                    await (
                        await (
                            new AccountAllowanceApproveTransaction()
                        ).approveHbarAllowance(ownerAccount.ID, spenderAccount.ID, Hbar.from(amount))
                    ).freezeWith(ownerAccount.CLIENT)
                ).sign(signerPrivateKey)
            ).signWithOperator(ownerAccount.CLIENT)
        ).execute(ownerAccount.CLIENT)
    ).getReceipt(ownerAccount.CLIENT);
}

exports.transferBySpender = async ({ signerAccount, fromAccount, toAccount, amount }) => {
    const signerPrivateKey = signerAccount.PRIVATE_KEY;
    const singerWallet = signerAccount.WALLET;
    return await (
        await (
            await (
                await (
                    await (
                        await new TransferTransaction()
                            .addApprovedHbarTransfer(
                                fromAccount.ID,
                                new Hbar(amount).negated()
                            )
                            .addHbarTransfer(toAccount.ID, new Hbar(amount))
                            .setTransactionId(TransactionId.generate(signerAccount.ID))
                    ).freezeWith(signerAccount.CLIENT)
                ).sign(signerPrivateKey)
            ).signWithOperator(signerAccount.CLIENT)
        ).execute(signerAccount.CLIENT)
    ).getReceipt(signerAccount.CLIENT);
}

exports.createTopic = async (client) => {
    const topicTx = new TopicCreateTransaction();
    const response = await topicTx.execute(client)
    return await response.getReceipt(client);
}

exports.submitMessageToTopic = async (client, {
    topicId,
    message
}) => {
    const topicMsgTx = new TopicMessageSubmitTransaction({
        topicId: topicId,
        message,
    });
    const txResponse = await topicMsgTx.execute(client)
    return await txResponse.getReceipt(client);
}

exports._getTokenType = (tokenType) => {
    switch (tokenType) {
        case this.CONSTANTS.TOKENS.TYPES.FUNGIBLE:
            return TokenType.FungibleCommon;
        case this.CONSTANTS.TOKENS.TYPES.NON_FUNGIBLE:
            return TokenType.NonFungibleUnique;
        default:
            throw new Error(`Token type ${tokenType} is not supported`)
    }
}

exports._getSupplyType = (supplyType) => {
    switch (supplyType) {
        case this.CONSTANTS.TOKENS.SUPPLY.TYPES.FINITE:
            return TokenSupplyType.Finite;
        default:
            throw new Error(`Token supply type ${supplyType} is not supported`)
    }
}