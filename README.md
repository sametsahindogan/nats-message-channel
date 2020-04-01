# nats-message-channel

[![GitHub license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](https://raw.githubusercontent.com/sametsahindogan/nats-message-channel/master/LICENSE)

> Implementation of [NATS MQ](https://nats.io/) with websocket protocol.

# Scenario

Let's say we want to send real-time notifications / messages to our users without using Socket IO or Pusher.

And of course we want to separate it from our backend server to scale it freely.

**Our implementation scenario will be as follows;**

- **Step 1:** Of course, there should be an authentication process. When users first load the page, they send a message to our Websocket server with their own tokens.

- **Step 2:** Our Websocket server send these credentials to the authentication channel ([via req/reply method](https://docs.nats.io/nats-concepts/reqreply)) on the NATS server.

- **Step 3:** Our backend server has subscribed to the authentication channel. It performs the authentication process according to the incoming message.

- **Step 4:** Once authentication is successful, our Websocket server marks this connection as authed and allows it to subscribe to the user-specific notification channel on the NATS server.

- **Step 5:** When an event occurs (eg. order received), our backend server sends this notification to the user-specific notification channel on NATS server.

- **Step 6:** Our websocket server receives the notification message through the NATS server and sends it to the user as real-time.


Our websocket server is written in **NodeJS**.

**Suppose that our backend project is written in PHP.** At that case our publisher and subscriber will be written in PHP.

## Installation

First of all, you should [install  to NATS server](https://docs.nats.io/nats-server/installation).


Go to `/websocket` folder and run ;

```bash
npm install
```

Go to `/api` folder and run;
```bash
composer install
```

## Usage

We need to run our Websocket server and Auth Subscriber.

1. Go to `/api` folder and run;
```bash
node app.js
```

2. For authentication, we run our authentication subscriber in our backend.
Go to `/api` folder and run;
```bash
php authSubscriber.php
```

3. Open `/client/user1.html` file on web browser then click the `subscribe` button. 

Now you can send a notification to the user-specific notification channels that the user is subscribed.

For example;

4. Go to `/api` and run this command ( first argument is user id, second is message );

```bash
php notificationPublisher.php 1 hello!
```
---
**A screenshot of the processes in the background. You can follow the life cycle from the descriptions on terminal;**

<a><img src="https://raw.githubusercontent.com/sametsahindogan/nats-message-channel/master/lifecycle.png"></a>

## Summary

You can adapt it to your own project, inspired by the architecture in this project.

## License
MIT © [Samet Sahindogan](https://raw.githubusercontent.com/sametsahindogan/nats-message-channel/master/LICENSE)
