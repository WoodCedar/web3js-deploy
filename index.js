let Web3 = require('web3');
let solc = require('solc');
let fs=require('fs');

require("dotenv").config();
const privatekey=process.env.PRIVATE_KEY;

const source = fs.readFileSync("Incrementer.sol","utf8");

const input = {
    language: 'Solidity',
    sources: {
        'Incrementer.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};
const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));

const contractFile=tempFile.contracts["Incrementer.sol"]["Incrementer"];

const bytecode = contractFile.evm.bytecode.object;
const abi=contractFile.abi;

const web3 = new Web3('https://kovan.infura.io/v3/329c7a7f60ef4c86a97ca727ddfee4b8');

const account = web3.eth.accounts.privateKeyToAccount(privatekey);
const account_from = {
    privateKey: privatekey,
    accountAddress: account.address,
};

const Deploy = async () => {

    const deployContract = new web3.eth.Contract(abi);


    const deployTx = deployContract.deploy({
        data: bytecode,
        arguments: [5],
    });

    const deployTransaction = await web3.eth.accounts.signTransaction(
        {
            data: deployTx.encodeABI(),
            gas: 8000000,
        },
        account_from.privateKey
    );

    const deployReceipt = await web3.eth.sendSignedTransaction(deployTransaction.rawTransaction);


    console.log(`Contract deployed at address: ${deployReceipt.contractAddress}`);
};


Deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });