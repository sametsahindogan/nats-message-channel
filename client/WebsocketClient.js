'use strict';

/**
 * WebsocketClient class.
 */
class WebsocketClient {

    /**
     * Initialize Websocket Client.
     *
     * @param {string} host
     * @param {string} port
     */
    constructor(host, port) {

        this.container = document.getElementById('container-main');
        this.unsubscribeButton = document.getElementById('unsubscribe-channel');
        this.subscribeButton = document.getElementById('subscribe-channel');

        this.connectionString = 'ws://' + host + ':' + port;

        this.ws = new WebSocket(this.connectionString);

    }

    /**
     * Send with given params,
     * then listen notification channel.
     *
     * @param {object} credentials
     */
    connect = (credentials) => {

        if (this.ws.readyState === WebSocket.CLOSED) {
            this.ws = new WebSocket(this.connectionString);

            this.ws.onopen = () => {
                this.ws.send(JSON.stringify(credentials));
            };

        } else {
            this.ws.send(JSON.stringify(credentials));
        }

        this.appendHtml('<div class="alert alert-warning">\n' +
            '        <strong>Authentication:</strong> Wait for a authentication...\n' +
            '    </div>');

        this.ws.onmessage = (response) => {

            let authenticate = JSON.parse(response.data);

            if (authenticate.success) {

                this.notification({'type': 'NOTIFICATION'});

            } else {
                this.appendHtml('<div class="alert alert-danger">\n' +
                    '        <strong>Authentication:</strong> Error! Invalid credentials.\n' +
                    '    </div>');

                this.ws.close();
            }

        };
    };

    /**
     * Send notification request to websocket server.
     */
    notification = (message) => {

        this.appendHtml('<div class="alert alert-info">\n' +
            '        <strong>Authentication:</strong> Successfully authenticated. Wait for a notifications...\n' +
            '    </div>');

        this.ws.send(JSON.stringify(message));

        this.ws.onmessage = (response) => {

            let notification = JSON.parse(response.data);

            this.appendHtml('<div class="alert alert-success">\n' +
                '        <strong>Nofication: </strong> ' + notification.data +
                '    </div>');
        }

    };

    /**
     * Disconnect from websocket server.
     */
    disconnect = () => {

        this.ws.close();

        this.ws.onclose = () => {

            this.appendHtml('<div class="alert alert-danger">\n' +
                '        <strong>Websocket Server:</strong> Connection closed.\n' +
                '    </div>');

        };
    };

    /**
     * Set button properties.
     *
     * @param {boolean} isSubscribed
     */
    setButtonProperties = (isSubscribed = true) => {

        if (!isSubscribed) {
            this.unsubscribeButton.setAttribute('disabled', true);
            this.subscribeButton.removeAttribute('disabled');

            return;
        }

        this.unsubscribeButton.removeAttribute('disabled');
        this.subscribeButton.setAttribute('disabled', true);
    };

    /**
     * Append data to container.
     *
     * @param {string} data
     */
    appendHtml = (data) => {

        this.container.insertAdjacentHTML('beforeend', data);
    };
}