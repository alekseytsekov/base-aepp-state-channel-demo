const {
    MemoryAccount,
    Channel,
    Crypto,
    Universal,
    TxBuilder,
    Ae,
    Aepp
} = require('@aeternity/aepp-sdk')

const {
    API_URL,
    INTERNAL_API_URL,
    STATE_CHANNEL_URL,
    NETWORK_ID,
    RESPONDER_HOST,
    RESPONDER_PORT
} = require('./config/nodeConfig');


const initiatorKeyPair = {
    publicKey: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
    secretKey: 'bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca'
}

const responderKeyPair = {
    publicKey: 'ak_fUq2NesPXcYZ1CcqBcGC3StpdnQw3iVxMA3YSeCNAwfN4myQk',
    secretKey: '7c6e602a94f30e4ea7edabe4376314f69ba7eaa2f355ecedb339df847b6f0d80575f81ffb0a297b7725dc671da0b1769b1fc5cbe45385c7b5ad1fc2eaf1d609d'
}

const initiatorAddress = initiatorKeyPair.publicKey;
const responderAddress = responderKeyPair.publicKey;

let initiatorAccount;
let responderAccount;

const params = {
    // Public key of initiator
    // (in this case `initiatorAddress` defined earlier)
    initiatorId: initiatorAddress,
    // Public key of responder
    // (in this case `responderAddress` defined earlier)
    responderId: responderAddress,
    // Initial deposit in favour of the responder by the initiator
    pushAmount: 0,
    // Amount of tokens initiator will deposit into state channel
    initiatorAmount: 10000000000010000000,
    // Amount of tokens responder will deposit into state channel
    responderAmount: 10000000000010000000,
    // Minimum amount both peers need to maintain
    channelReserve: 1000000000001000000,
    // Minimum block height to include the channel_create_tx
    ttl: 1000,
    // Amount of blocks for disputing a solo close
    lockPeriod: 10,
    // Host of the responder's node
    host: RESPONDER_HOST,
    // Port of the responders node
    port: RESPONDER_PORT,
}

console.log('------------------ STATE CHANNEL DEMO -----------------------')

const BaseAe = (_params) => Universal.compose({
    deepProps: { 
        Swagger: { 
            defaults: { 
                debug: !!process.env['DEBUG'] 
            } 
        } 
    },
    props: { 
        API_URL, 
        INTERNAL_API_URL, 
        process, 
        compilerUrl: 'https://compiler.aepps.com'
    }
})({ ..._params });



async function createAccounts() {
    
    // initiatorAccount = await BaseAe({
    //     networkId: NETWORK_ID,
    //     // url: API_URL,
    //     // internalUrl: INTERNAL_API_URL,
    //     // compilerUrl: 'https://compiler.aepps.com',
    //     keypair: initiatorKeyPair,
    // });

    // initiatorAccount.setKeypair(initiatorKeyPair)

    // responderAccount = await BaseAe({
    //     networkId: NETWORK_ID,
    //     // url: API_URL,
    //     // internalUrl: INTERNAL_API_URL,
    //     // compilerUrl: 'https://compiler.aepps.com',
    //     keypair: responderKeyPair,
    // });

    // responderAccount.setKeypair(responderKeyPair)

    console.log('------------------ await Aepp() ---------------------');
    console.log(await Aepp());
    console.log('------------------ await Aepp() ---------------------');
    console.log();

    initiatorAccount = await Universal({
        networkId: NETWORK_ID,
        url: API_URL,
        internalUrl: INTERNAL_API_URL,
        keypair: initiatorKeyPair,
        compilerUrl: 'https://compiler.aepps.com',
    })
    responderAccount = await Universal({
        networkId: NETWORK_ID,
        url: API_URL,
        internalUrl: INTERNAL_API_URL,
        keypair: responderKeyPair,
        compilerUrl: 'https://compiler.aepps.com',
    });

    let result = await initiatorAccount.spend(params.initiatorAmount, responderKeyPair.publicKey);

    let balanceOfInitiator = await initiatorAccount.balance(initiatorKeyPair.publicKey);
    console.log('[BALANCE] initiator', balanceOfInitiator);
    
    let balanceOfResponder = await responderAccount.balance(responderKeyPair.publicKey);
    console.log('[BALANCE] responder', balanceOfResponder);

    console.log();

    console.log('funded');
    console.log(result);
}

// console.log( createAccounts(initiatorKeyPair).then((r,e) => {
//     console.log(r);
//     console.log(e);
// }))

// (async function(){
//     await createAccounts();

//     let aa = responderAccount.signTransaction('tx_+HcyAaEB6bv2BOYRtUYKOzmZ6Xcbb2BBfXPOfFUZ4S9+EnoSJcqCw1ChAVdfgf+wope3cl3GcdoLF2mx/Fy+RThce1rR/C6vHWCdgsNQgpxACgCCTiDAoAAQgI1ZAPpXMi6/bkGIMNO+WjPcZZ92aix8iJGet+YkC6RUXYo=');
//     console.log(await aa);
// })()

async function initiatorSign(tag, tx) {
    console.log('[SIGN] initiator', tag);
    console.log('[SIGN] initiator', tx);

    if (tag === 'initiator_sign') {
        console.log('==> initiator_sign:');
        //console.log();

        return initiatorAccount.signTransaction(tx)
    }

    // Deserialize binary transaction so we can inspect it
    // const txData = Crypto.deserialize(Crypto.decodeTx(tx), {
    //     prettyTags: true
    // })

    //const txData = deserializeTx(tx);

    // console.log();
    // console.log('----> txData');
    // console.log(txData);

    // console.log('==> initiatorSign txData');
    // console.log(txData);
    // console.log();

    if (tag === 'shutdown_sign_ack') {
        if (true 
            // txData.tag === 'CHANNEL_CLOSE_MUTUAL_TX' //&& TURN ME ON AFTER DESERIALIZE TX WORK AGAIN
            // To keep things simple we manually check that
            // balances are correct (as a result of previous transfer update)
            // txData.initiatorAmount === 49990 &&
            // txData.responderAmount === 50010
        ) {
            return initiatorAccount.signTransaction(tx)
        }
    }

    console.log('[ERROR] missing sign operation');
}

function deserializeTx(tx) {
    const txData = Crypto.deserialize(Crypto.decodeTx(tx), {
        prettyTags: true
    })

    // const txData = TxBuilder.unpackTx(tx);

    console.log(txData);
    
    return txData;
}

async function responderSign(tag, tx) {
    console.log('[SIGN] responder', tag);
    console.log('[SIGN] responder', tx);
    // console.log(tag);
    // console.log();

    if (tag === 'responder_sign') {
        return responderAccount.signTransaction(tx)
    }

    // Deserialize binary transaction so we can inspect it
    // >>> !!! TURN ME ON AFTER DESERIALIZE TX WORK AGAIN !!! <<<
    const txData = deserializeTx(tx);
    // console.log();
    // console.log('----> txData');
    // console.log(txData);

    // When someone wants to transfer a tokens we will receive
    // a sign request with `update_ack` tag
    if (tag === 'update_ack') {

        // console.log('==> txData');
        // console.log(txData);
        // console.log();

        // Check if update contains only one offchain transaction
        // and sender is initiator
        if (
            true 
            // txData.tag === 'CHANNEL_OFFCHAIN_TX' &&
            // txData.updates.length === 1 &&
            // txData.updates[0].from === initiatorAddress
        ) {
            return responderAccount.signTransaction(tx)
        }
    }

    console.log('[ERROR] missing sign operation');
}

async function connectAsInitiator(params) {
    return Channel({
        ...params,
        url: STATE_CHANNEL_URL,
        role: 'initiator',
        sign: initiatorSign
    })
}

async function connectAsResponder(params) {
    return Channel({
        ...params,
        url: STATE_CHANNEL_URL,
        role: 'responder',
        sign: responderSign
    })
}



createAccounts().then(() => {

    console.log('params');
    console.log(params);


    // initiator connects to state channels endpoint
    connectAsInitiator(params).then(initiatorChannel => {

        initiatorChannel.on('statusChanged', (status) => {
            console.log(`[${status.toUpperCase()}]`);
        })

        initiatorChannel.on('onChainTx', (tx) => {
            console.log('==> channel_create_tx:', tx)
        })

        // off chain balances
        getOffChainBalances1(initiatorChannel)
        
        if (false) {
            initiatorChannel.balances(
                [initiatorKeyPair.publicKey],
            ).then(function (balances) {
                console.log('-=-=>> off chain balance')
                console.log(balances[initiatorKeyPair.publicKey])
            }).catch(e => console.log(e))
        }


        //getOffChainBalances1(initiatorChannel)
        initiatorChannel.sendMessage('hello world', responderAddress)

        initiatorChannel.update(
            // Sender account
            initiatorAddress,
            // Recipient account
            responderAddress,
            // Amount
            10,
            // This function should verify offchain transaction
            // and sign it with initiator's private key
            async (tx) => initiatorAccount.signTransaction(tx)
        ).then((result) => {
            if (result.accepted) {
                console.log('==> Successfully transfered 10 tokens!', result)
            } else {
                //console.log('=====> Transfer has been rejected')
            }
        }).catch(e => {
            console.log('==> Error:', e);
        })

        initiatorChannel.on('error', err => console.log(err))

        // setTimeout(() => {
        //     // this work
        //     // initiatorChannel.leave().then(({channelId, state}) => {
        //     //     console.log('=*=> leaving the channel');
        //     //     console.log(channelId);
        //     //     console.log(state);
        //     // })
        // }, 15000)

    }).catch(err => {
        console.log('==> Initiator failed to connect')
        console.log(err)
    })

    // responder connects to state channels endpoint
    connectAsResponder(params).then(responderChannel => {
        responderChannel.on('message', (msg) => {
            console.log('==>Received message from:', msg)
        })

        // close channel after a minute
        setTimeout(() => {
            responderChannel.shutdown(
                // This function should verify shutdown transaction
                // and sign it with responder's secret key 
                async (tx) => responderAccount.signTransaction(tx)
            ).then((tx) => {
                console.log('==> State channel has been closed. You can track this transaction onchain', tx)
            }).catch(e => {
                console.log('==> Error:', e);
            })
        }, 30000)

        responderChannel.on('error', err => console.log(err))
    }).catch(err => {
        console.log('==> Responder failed to connect')
        console.log(err)
    });

    async function getOffChainBalances2(channel) {
        // off chain balances
       let balances = await channel.balances([ initiatorKeyPair.publicKey, responderKeyPair.publicKey]);
       console.log('-=-=>> off chain balance 2')
       console.log(balances[initiatorKeyPair.publicKey])
       console.log(balances[responderKeyPair.publicKey])
   }

    function getOffChainBalances1(channel) {
        // off chain balances
        channel.balances([
            initiatorKeyPair.publicKey, 
            responderKeyPair.publicKey])
            .then(function (balances) {
                console.log('-=-=>> off chain balance 1')
                console.log(balances[initiatorKeyPair.publicKey])
                    console.log(balances[responderKeyPair.publicKey])
            }).catch(e => console.log(e))
    }
})

// show seconds
function aa (maxSeconds) {
    let currentSecond = 0;
    let interval = setInterval(function () {
        console.log(currentSecond++);
        if(currentSecond >= maxSeconds) {
            clearInterval(interval);
        }
    }, 1000);
}