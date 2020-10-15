"use strict";

const WebSocket = require('ws');
const ChannelService = require('./ChannelService');
const helpers = require('./helpers');
const nats = require('nats');

/**
 * WebsocketServer class
 */
class WebsocketServer {

    /**
     * WebsocketServer constructor.
     *
     * @constructor
     */
    constructor() {

        const server = new WebSocket.Server({port: 6003});
        this.startServer(server);
    };

    /**
     * Websocket server process.
     *
     * @param {WebSocket} server
     */
    startServer = (server) => {

        helpers.logger('INFO', `WS server started.`);

        server.on('connection', (websocket, req) => {

            let natsClient = nats.connect();
            let connectionId = req.headers['sec-websocket-key'];
            let connections = server.clients.size;

            helpers.logger('INFO', `Connection opened. ID: ${connectionId}`);
            helpers.logger('INFO', `Number of connections now: ${connections}`);
            helpers.logger('NATS', `client connected.`);

            /**
             * When client sends a message.
             */
            websocket.on('message', async (message) => {

                helpers.logger('INFO', `Message arrived: ${message}`);
                helpers.logger('INFO', `Message is from: ${connectionId} connection type: ${websocket.connection_type || 'GUEST'}`);

                try {
                    const data = await this.validateMessageStructure(message, websocket);

                    this.handleMessages(data, websocket, connectionId, natsClient);

                } catch (exception) {

                    helpers.logger('ERROR', `${exception}: ${message}`);

                    websocket.send(JSON.stringify({'success': false, 'message': exception}));
                    websocket.close();
                }
            });


            /**
             * When client closed the connection.
             */
            websocket.on('close', () => {

                natsClient.close();
                helpers.logger('NATS', `client disconnected.`);
                helpers.logger('INFO', `Connection closed. ID: ${connectionId}`);
                helpers.logger('INFO', `Number of remaining connections: ${connections}`);
            });

        });
    };

    /**
     * Validate structure incoming messages.
     *
     * @param {string} message
     * @returns {Promise<unknown>}
     */
    validateMessageStructure = (message) => {

        return new Promise((resolve, reject) => {

            const messageTypes = ['AUTH', 'NOTIFICATION'];

            if (!helpers.isJson(message)) {
                reject('Invalid JSON message structure');
            }

            let data = JSON.parse(message);

            if (!('type' in data)) {
                reject('Invalid message structure. Type field is required');
            }

            if (!(messageTypes.includes(data['type']))) {
                reject('Invalid message type');
            }

            resolve(data);

        });
    };

    /**
     * Handle websocket events.
     *
     * @param {array} data
     * @param {object} websocket
     * @param {string} connectionId
     * @param {object} natsClient
     */
    handleMessages = async (data, websocket, connectionId, natsClient) => {

        const channelService = new ChannelService(data, websocket, natsClient, connectionId);

        if (data['type'] === 'AUTH') {

            try {

                await channelService.authenticationChannel();

            } catch (exception) {

                websocket.send(exception);

                websocket.close();
                helpers.logger('ERROR', `Authentication error.`);
            }

        } else if (data['type'] === 'NOTIFICATION' && websocket.connection_type === 'AUTHED') {

            await channelService.notificationChannel();

        }

    };

}

module.exports = WebsocketServer;