
let useTestNetConfiguration = false;

// https://sdk-testnet.aepps.com/

// const wsAddress = 'wss://sdk-testnet.aepps.com';
// const httpAddress = 'https://sdk-testnet.aepps.com'

const httpAddress = 'http://localhost:3013';
const wsAddress = 'ws://localhost:3014';

const API_URL = useTestNetConfiguration ? httpAddress : 'http://localhost:3001';
const INTERNAL_API_URL = 'http://localhost:3113';
const STATE_CHANNEL_URL = useTestNetConfiguration ?  wsAddress : 'ws://localhost:3001'
const NETWORK_ID = useTestNetConfiguration ? 'ae_uat' : 'ae_devnet'; // 'ae_uat'; //'ae_docker' , ae_devnet
const RESPONDER_HOST = useTestNetConfiguration ? wsAddress : 'localhost';
const RESPONDER_PORT = 3333

// const API_URL = 'http://localhost:3013';
// const INTERNAL_API_URL =  'http://localhost:3113' 
// const STATE_CHANNEL_URL = 'ws://localhost:3014';
// const NETWORK_ID = 'ae_uat';
// const RESPONDER_HOST = 'localhost';
// const RESPONDER_PORT = 3333;

module.exports = {
    API_URL,
    INTERNAL_API_URL,
    STATE_CHANNEL_URL,
    NETWORK_ID,
    RESPONDER_HOST,
    RESPONDER_PORT
}