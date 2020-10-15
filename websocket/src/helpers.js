'use strict';

const time = require('date-format');

/**
 *
 * Print on terminal.
 *
 * @param {string} type
 * @param {string} message
 * @param {string} channel
 */
let logger = (type = '', message, channel = '') => {
    console.log(`[${now()}][${type}][${channel}] ${message}`);
};

/**
 * Return now date as string.
 *
 * @returns {string}
 */
let now = () => {
    return time.asString('dd-MM-yyyy hh:mm:ss', new Date());
};

/**
 * Check string is JSON.
 *
 * @param str
 * @returns {boolean}
 */
let isJson = (str) => {

    try {

        JSON.parse(str);

    } catch (exception) {

        return false;

    }

    return true;
};

module.exports = {logger, isJson};