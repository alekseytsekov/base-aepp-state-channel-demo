const {
    MemoryAccount,
    Channel,
    Crypto,
    Universal,
    TxBuilder
} = require('@aeternity/aepp-sdk');

const {
    API_URL,
    INTERNAL_API_URL,
    STATE_CHANNEL_URL,
    NETWORK_ID,
    RESPONDER_HOST,
    RESPONDER_PORT
} = require('./../config/nodeConfig');

const amounts = require('./../config/stateChannelConfig').amounts;

const keyPair = require('./../config/keyPair');
const products = require('./../config/products');
const FUND_AMOUNT = amounts.deposit * 30;

let openChannels = new Map();

let createAccount = async function (keyPair) {
    let tempAccount = await Universal({
        networkId: NETWORK_ID,
        url: API_URL,
        internalUrl: INTERNAL_API_URL,
        keypair: {
            publicKey: keyPair.publicKey,
            secretKey: keyPair.secretKey
        },
        //compilerUrl: 'https://compiler.aepps.com',
        compilerURL: 'http://localhost:3080'
    })

    return tempAccount;
}

let account;

(async function () {
    console.log('NETWORK_ID:', NETWORK_ID);
    console.log();
    account = await createAccount(keyPair);

    // let aa = await account.spend(FUND_AMOUNT, 'ak_qyLhSWtZNG1hbM4QVqQeJcQJu8mcBPz571qfBeV789918pRhN'); 
})()

async function createChannel(req, res) {

    let params = req.body.params;
    let channel = await connectAsResponder(params);

    let data = {
        channel,
        round: 1,
        product: {
            name: '',
            price: 0
        },
        isSigned: true,
        boughtProducts: 0
    }

    openChannels.set(params.initiatorId, data);

    let info = {
        name: 'DEPOSIT',
        amount: params.initiatorAmount,
        message: 'State channel is successfully created!'
    }

    channel.sendMessage(JSON.stringify(info), params.initiatorId);

    res.send('ok');
}

async function buyProduct(req, res) {
    
    let initiatorAddress = req.body.initiatorAddress;
    let productName = req.body.productName;

    let productPrice = products[productName];
    let data = openChannels.get(initiatorAddress);

    console.log(`[BUY] round: ${data.round}, module: ${data.round % 5}`);
    console.log(data)

    if (productPrice && data ) { // && data.isSigned

        data.boughtProducts++;

        if(data.boughtProducts % 5 === 0) {
            productPrice = 0;
        }

        data.round++;
        data.product = {
            name: productName,
            price: productPrice
        }
        data.isSigned = false;
        

        //data.channel.sendMessage('update successfully signed', initiatorAddress);
        getOffChainBalances(data.channel);

        openChannels[initiatorAddress] = data;

        res.send({
            price: productPrice
        });
    } else {
        console.log('[ERROR] buyProduct')
        res.status(404);
        res.end();
    }
}

function stopChannel(req, res) {

    console.log('[CLOSE] request body');
    console.log(req.body);
    console.log();

    let initiatorAddress = req.body.initiatorAddress;
    let result = openChannels.delete(initiatorAddress);

    res.send(result);
}

async function faucet(req, res) {

    let pubKey = req.query.pubKey;
    if(!pubKey) {
        res.send({
            success: false,
            message: `Invalid public key!`
        });

        return;
    }

    let balanceOfInitiator = 0;
    try {
        balanceOfInitiator = await account.balance(pubKey);
        let responderBalance = await account.balance(keyPair.publicKey);
        console.log('[BACK-END] balance:', responderBalance / amounts.deposit);
    } catch (error) {
        
    }

    try {

        if(balanceOfInitiator >= FUND_AMOUNT) {
            res.send({
                success: true,
                message: `[FAUCET] Public key: '${pubKey}' has enough aettos to open a channel: ${balanceOfInitiator} aettos.`
            });
        } else {
            let result = await account.spend(FUND_AMOUNT, pubKey);
            console.log()
            console.log('[FAUCET]', result);
            console.log()
            res.send({
                success: true,
                message: `[FAUCET] Public key: '${pubKey}' is funded with ${FUND_AMOUNT} aettos.`
            });
        }

        
    } catch (error) {
        console.log(`[ERROR] [FAUCET]`);
        console.log(error);
        console.log();

        res.send({
            success: false,
            message: `Something went wrong, cannot fund this public key. For more info look at terminal!`
        });
    }
}

// connect as responder or initiator 
async function connectAsResponder(params) {

    const TIMEOUT = 1000 * 60 * 20;

    const _params = {
        ...params,
        url: STATE_CHANNEL_URL,
        role: 'responder',
        sign: responderSign,
        // can I add this additional params ???
        // timeout_accept : TIMEOUT,
        // timeout_funding_lock : TIMEOUT,
        // timeout_awaiting_locked : TIMEOUT,
        // timer_funding_lock: TIMEOUT,
        // timeout_idle: TIMEOUT,
        // timeout_funding_create: TIMEOUT,
        // timeout_sign: TIMEOUT,

        //timeout_awaiting_open: TIMEOUT,
        // timeout_idle: TIMEOUT,
        minimum_depth: 0
    };

    return await Channel(_params);
}

async function responderSign(tag, tx) {
    console.log('[SIGN] responder');

    if(tag === 'deposit_ack') {
        console.log('[deposit_ack]');
        console.log(tx);
        console.log();
        return account.signTransaction(tx)
    }

    // Deserialize binary transaction so we can inspect it
    let txData = deserializeTx(tx);

    tag = txData.tag;


    if (tag === 'responder_sign' || tag === 'CHANNEL_CREATE_TX') {
        console.log(txData);
        console.log();
        return account.signTransaction(tx)
    }

    

    // When someone wants to transfer a tokens we will receive
    // a sign request with `update_ack` tag
    if (tag === 'update_ack' || tag === 'CHANNEL_OFFCHAIN_TX' || tag === 'CHANNEL_OFFCHAIN_UPDATE_TRANSFER') {


        console.log(txData);
        console.log();

        let isValid = isTxValid(txData);
        if (!isValid) {
            // TODO: challenge/dispute
            console.log('[ERROR] transaction is not valid');
        }



        // Check if update contains only one offchain transaction
        // and sender is initiator
        if (txData.tag === 'CHANNEL_OFFCHAIN_TX') { //  && isValid
            sendConfirmMsg(txData);
            return account.signTransaction(tx);
        }
    }

    if (tag === 'shutdown_sign_ack' || tag === 'CHANNEL_CLOSE_MUTUAL_TX') { // && txData.tag === 'CHANNEL_CLOSE_MUTUAL_TX'
        console.log('txData');
        console.log('...maybe this data is INCORRECT, shows some strange responder amount....');
        console.log(txData);
        console.log();
        return account.signTransaction(tx);
    }


    console.log('[ERROR] ==> THERE IS NO SUITABLE CASE TO SIGN');
    console.log(txData);
    console.log();
}

function isTxValid(txData) {
    let lastUpdateIndex = txData.updates.length - 1;
    if (lastUpdateIndex < 0) {
        console.log('[TX_VALIDATION] ==> last index is smaller than 0')
        return false;
    }

    let lastUpdate = txData.updates[lastUpdateIndex];
    let data = openChannels.get(lastUpdate.from);
    if (!data) {
        console.log('[TX_VALIDATION] ==> no data <==')
        return false;
    }

    let isRoundValid = data.round === txData.round;
    let isPriceValid = data.product.price === txData.updates[lastUpdateIndex].amount;
    let isValid = isRoundValid && isPriceValid;

    if(!isRoundValid) {
        console.log('[TX_VALIDATION] ==> invalid round <==');
    }

    if (!isPriceValid) {
        console.log('[TX_VALIDATION] ==> invalid price <==');
    }

    if (isValid) {
        openChannels[lastUpdate.from].isSigned = true;
    }

    return isValid;
}

function sendConfirmMsg(txData) {

    let from = txData.updates[txData.updates.length - 1].from;

    let data = openChannels.get(from);
    let msg = `[OFF_CHAIN] Successfully bought ${data.product.name} for ${data.product.price} aettos.`;

    let dataInfo = {
        name: data.product.name,
        amount: data.product.price,
        message: msg,
        isNextFree : (data.boughtProducts + 1) % 5 === 0
    }

    data.channel.sendMessage(JSON.stringify(dataInfo), from);
}

function deserializeTx(tx) {
    const txData = Crypto.deserialize(Crypto.decodeTx(tx), {
        prettyTags: true
    });

    return txData;
}

function getOffChainBalances(channel) {
    // off chain balances
    channel.balances([ keyPair.publicKey ])
        .then(function (balances) {
            console.log('==> off chain balance');
            console.log('=== host:', balances[keyPair.publicKey]);
            console.log();
        }).catch(e => console.log(e))
}

module.exports = {
    get: {
        faucet
    },
    post: {
        createChannel,
        buyProduct,
        stopChannel
    }
}

