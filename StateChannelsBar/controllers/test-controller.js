const {
    Channel,
    Universal,
} = require('@aeternity/aepp-sdk')

const {
    API_URL,
    INTERNAL_API_URL,
    STATE_CHANNEL_URL,
    NETWORK_ID,
    RESPONDER_HOST,
    RESPONDER_PORT
} = require('./../config/nodeConfig');

async function test(req, res) {

    let a = async function () {

        const compilerURL = 'localhost:10101' // https://compiler.aepps.com'
    
        // const initiatorKeyPair = {
        //     publicKey: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU',
        //     secretKey: 'bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca'
        // }
        
        const responderKeyPair = {
            publicKey: 'ak_fUq2NesPXcYZ1CcqBcGC3StpdnQw3iVxMA3YSeCNAwfN4myQk',
            secretKey: '7c6e602a94f30e4ea7edabe4376314f69ba7eaa2f355ecedb339df847b6f0d80575f81ffb0a297b7725dc671da0b1769b1fc5cbe45385c7b5ad1fc2eaf1d609d'
        }
    
        //let initiator
        let responder
        //let initiatorCh
        let responderCh
        
        await createAccounts();
        
        async function createAccounts() {
        
            // initiator = await Universal({
            //     networkId: NETWORK_ID,
            //     url: API_URL,
            //     internalUrl: INTERNAL_API_URL,
            //     keypair: initiatorKeyPair,
            //     compilerUrl: compilerURL
            // })
            
            responder = await Universal({
                networkId: NETWORK_ID,
                url: API_URL,
                internalUrl: INTERNAL_API_URL,
                keypair: responderKeyPair,
                compilerUrl: compilerURL
            });
    
            //let result = await initiator.spend('6000000000000000', responderKeyPair.publicKey);
        
            // let balanceOfInitiator = await initiator.balance(initiatorKeyPair.publicKey); // ak_2fsZ9H3veZedfaCgX3GZpWvfxx1Z5T4n4dQXVhYKEdu8SwEX6q
            let balanceOfInitiator = await responder.balance('ak_2fsZ9H3veZedfaCgX3GZpWvfxx1Z5T4n4dQXVhYKEdu8SwEX6q'); // ak_2fsZ9H3veZedfaCgX3GZpWvfxx1Z5T4n4dQXVhYKEdu8SwEX6q
            console.log('[BALANCE] initiator', balanceOfInitiator);
            
            let balanceOfResponder = await responder.balance(responderKeyPair.publicKey);
            console.log('[BALANCE] responder', balanceOfResponder);
        
            console.log();
        
            // console.log('funded');
            // console.log(result);
            // console.log();
        }
        
        // const initiatorSign = (tag, tx) => {
        //     console.log('initiator sign', tag);
        //     console.log(tx);
        //     console.log();
        //     return initiator.signTransaction(tx)
        // }
        
        const responderSign = (tag, tx) => {
            console.log('responder sign', tag);
            console.log(tx);
            console.log();
    
            return responder.signTransaction(tx)
        }
        
        const sharedParams = {
            url: 'ws://localhost:3001',
            pushAmount: 3,
            initiatorAmount: 1000000000000000,
            responderAmount: 1000000000000000,
            channelReserve: 20000000000,
            ttl: 10000,
            host: 'localhost',
            port: 3001,
            lockPeriod: 1,
            minimum_depth: 0,
            // timeout_idle: 1000 * 60 * 20
        }
    
        sharedParams.initiatorId = 'ak_2fsZ9H3veZedfaCgX3GZpWvfxx1Z5T4n4dQXVhYKEdu8SwEX6q' // await initiator.address()
        sharedParams.responderId = await responder.address()
    
        //await initiator.spend('6000000000000000', await responder.address())
        
        console.log('[SHARED PARAMS]');
        console.log({
            ...sharedParams,
            role: 'responder',
            sign: responderSign
        });
        console.log();
    
        // initiatorCh = await Channel({
        //     ...sharedParams,
        //     role: 'initiator',
        //     sign: initiatorSign
        // })
        
        responderCh = await Channel({
            ...sharedParams,
            role: 'responder',
            sign: responderSign
        })
    
        responderCh.on('statusChanged', (status) => {
            console.log(`[${status.toUpperCase()}]`);
            console.log();
        })
    
        // const amount = 10
        // const result = await initiatorCh.update(
        //   await initiator.address(),
        //   await responder.address(),
        //   amount,
        //   //initiatorSign
        //   async (tx) => initiator.signTransaction(tx)
        // );
    
        // console.log('[UPDATE]', result);
    
        setTimeout(() => {
            responderCh.shutdown(
                async (tx) => responder.signTransaction(tx)
            ).then((tx) => {
                console.log('==> State channel has been closed. You can track this transaction onchain', tx)
            }).catch(e => {
                console.log('==> Error:', e);
            })
        }, 70000)
    };

    await a();
    res.send('test run successfully!');
}

module.exports = {
    test: test
}