"use strict";

const helpers = require('./helpers');

/**
 * ChannelService class
 */
class ChannelService {

    /**
     * ChannelService constructor.
     *
     * @constructor
     * @param {array} data
     * @param {object} websocket
     * @param {object} natsClient
     * @param {string} connectionId
     */
    constructor(data, websocket, natsClient, connectionId) {

        this.data = data;
        this.websocket = websocket;
        this.natsClient = natsClient;
        this.connectionId = connectionId;
    }

    /**
     * Req/Reply authentication for NATS client.
     *
     * @returns {Promise<unknown>}
     */
    authenticationChannel = () => {

        return new Promise((resolve, reject) => {

            helpers.logger('CHANNEL', `Passing message: ${this.data['token']} to channel.`, 'authentication');

            this.natsClient.request('authentication', this.data['token'], null, (msg) => {

                helpers.logger('CHANNEL', `Message arrived: ${msg}`, 'authentication');

                let response = JSON.parse(msg);

                if (!response['success']) reject(msg);

                this.websocket.id = response['user_id'];
                this.websocket.connection_type = 'AUTHED';
                helpers.logger('INFO', `It is an AUTH message for ${this.connectionId} thus this connection type is marked as AUTHED.`);

                this.websocket.send(msg);
                helpers.logger('INFO', `Sending message ${msg} to ${this.connectionId}`);

                resolve(true);
            });

        });

    };

    /**
     * Subscribe a specific notification channel on NATS.
     *
     * @returns {Promise<unknown>}
     */
    notificationChannel = () => {

        // TODO: Handle NATS exceptions.

        return new Promise((resolve, reject) => {

            helpers.logger('CHANNEL', `Listening to channel.`, `notification_${this.websocket.id}`);
            this.natsClient.subscribe(`notification_${this.websocket.id}`, (msg, reply, subject, sid) => {

                helpers.logger('CHANNEL', `Message arrived: ${msg}`, `notification_${this.websocket.id}`);

                this.websocket.send(msg);
                helpers.logger('INFO', `Sending message ${msg} to ${this.connectionId}`);
            });

        });

    };

}

module.exports = ChannelService;