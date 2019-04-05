


`
docker run -p 3013:3013 -p 3015:3015 -p 3333:3333 -v ~/Documents/projects/aeternity/test-state-demo/state-testnet/StateChannelsBar/docker/test-net-config.yaml:/home/aeternity/.aeternity/aeternity/aeternity.yaml aeternity/aeternity
`

`
<0.20055.52>@sc_ws_handler:websocket_init:41 
Starting Channel WS with params #{
  <<"channel_reserve">> => <<"100000000000025">>,
  <<"host">> => <<"localhost">>,
  <<"initiator_amount">> => <<"400000000000100">>,
  <<"initiator_id">> => <<"ak_2fsZ9H3veZedfaCgX3GZpWvfxx1Z5T4n4dQXVhYKEdu8SwEX6q">>,
  <<"lock_period">> => <<"10">>,
  <<"port">> => <<"3333">>,
  <<"protocol">> => <<"json-rpc">>,
  <<"push_amount">> => <<"0">>,
  <<"responder_amount">> => <<"400000000000100">>,
  <<"responder_id">> => <<"ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU">>,
  <<"role">> => <<"responder">>,
  <<"ttl">> => <<"100000">>}
`
