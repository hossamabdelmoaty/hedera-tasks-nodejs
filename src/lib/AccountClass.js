const {
    Client,
    Wallet,
    PrivateKey,
    PublicKey
} = require("@hashgraph/sdk");

class Account {
    constructor({
        ID,
        CLIENT,
        WALLET,
        PRIVATE_KEY,
        PUBLIC_KEY,
        PRIVATE_KEY_DER_STRING,
        PUBLIC_KEY_DER_STRING
    }) {
        this.ID = ID;
        this.CLIENT = CLIENT;
        this.WALLET = WALLET;

        this.PRIVATE_KEY_DER_STRING = PRIVATE_KEY_DER_STRING;
        this.PRIVATE_KEY = PRIVATE_KEY || PrivateKey.fromString(this.PRIVATE_KEY_DER_STRING);


        this.PUBLIC_KEY_DER_STRING = PUBLIC_KEY_DER_STRING;
        this.PUBLIC_KEY = PUBLIC_KEY || PublicKey.fromString(this.PUBLIC_KEY_DER_STRING);


        const client = Client.forTestnet();
        client.setOperator(this.ID, this.PRIVATE_KEY);
        this.CLIENT = client;

        this.WALLET = new Wallet(this.ID, this.PRIVATE_KEY);
    }
}

module.exports = Account;
