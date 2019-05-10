
let useTestNetConfiguration = false;

// local node connected to the test-net
const httpAddress = 'http://localhost:3013';
const wsAddress = 'ws://localhost:3001' // 'ws://localhost:3014';

const API_URL = useTestNetConfiguration ? httpAddress : 'http://localhost:3001';
const INTERNAL_API_URL = 'http://localhost:3113';
const STATE_CHANNEL_URL = useTestNetConfiguration ?  wsAddress : 'ws://localhost:3001'
const NETWORK_ID = useTestNetConfiguration ? 'ae_uat' : 'ae_devnet';
const RESPONDER_HOST = 'localhost';
const RESPONDER_PORT = 3001 // 3333;

module.exports = {
    API_URL,
    INTERNAL_API_URL,
    STATE_CHANNEL_URL,
    NETWORK_ID,
    RESPONDER_HOST,
    RESPONDER_PORT
}