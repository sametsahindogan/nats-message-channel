"use strict";

const WebsocketServer = require('./src/WebsocketServer');

/*
   |--------------------------------------------------------------------------
   | Start Websocket Server
   |--------------------------------------------------------------------------
   |
   | Websocket awaiting connection for handling.
   |
*/
(new WebsocketServer());