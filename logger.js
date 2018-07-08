const winston = require('winston')
const path = require('path');
const moment = require('moment');
const PROJECT_ROOT = path.join(__dirname, '..');
const pjson = require("./package.json");

require('winston-papertrail').Papertrail;

const dotenv = require('dotenv').config({ path: 'variables.env' });


const consoleLogger = new winston.transports.Console({
    timestamp: function () {
        const today = moment();
        return today.format('DD-MM-YYYY h:mm:ssa');
    },
    colorize: true
})

const paperLogger = new winston.transports.Papertrail({
    host: process.env.PAPERTRAIL_HOST,
    port: process.env.PAPERTRAIL_PORT,
    program: pjson.name, //Get the name from the package JSON
    inlineMeta: true, //Everything on 1 line
    logFormat: function (level, message) {
        if (level === 'error') {
            return '<<< ERROR >>> ' + message;
        }
        return level + ' - ' + message;
    }
});

const logger = new winston.Logger({
    transports: [
        consoleLogger,
        paperLogger
    ]

});

if (process.env.NODE_ENV === 'production') {
    logger.transports.console.level = 'info';
    logger.transports.Papertrail.level = 'info';
}
if (process.env.NODE_ENV === 'development') {
    logger.transports.console.level = 'debug';
    logger.transports.Papertrail.level = 'debug';
}
if (process.env.NODE_ENV === 'local') {
    logger.transports.console.level = 'debug';
    logger.remove(logger.transports.Papertrail);
    logger.debug('Logger Removed Papertrail');
}
module.exports.info = function () {
    logger.info.apply(logger, formatLogArguments(arguments))
}

module.exports.log = function () {
    logger.log.apply(logger, formatLogArguments(arguments))
}
module.exports.warn = function () {
    logger.warn.apply(logger, formatLogArguments(arguments))
}
module.exports.debug = function () {
    logger.debug.apply(logger, formatLogArguments(arguments))
}
module.exports.verbose = function () {
    logger.verbose.apply(logger, formatLogArguments(arguments))
}
module.exports.error = function () {
    logger.error.apply(logger, formatLogArguments(arguments))
}

function formatLogArguments(args) {
    args = Array.prototype.slice.call(args)

    var stackInfo = getStackInfo(1)

    if (stackInfo) {
        // get file path relative to project root
        var calleeStr = '(' + stackInfo.relativePath + ':' + stackInfo.line + ')'

        if (typeof (args[0]) === 'string') {
            args[0] = args[0] + ' ' + calleeStr
        } else {
            args.unshift(calleeStr)
        }
    }

    return args
}

/**
 * Parses and returns info about the call stack at the given index.
 */
function getStackInfo(stackIndex) {
    // get call stack, and analyze it
    // get all file, method, and line numbers
    var stacklist = (new Error()).stack.split('\n').slice(3)

    // stack trace format:
    // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
    // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
    var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
    var stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi

    var s = stacklist[stackIndex] || stacklist[0]
    var sp = stackReg.exec(s) || stackReg2.exec(s)

    if (sp && sp.length === 5) {
        return {
            method: sp[1],
            relativePath: path.relative(PROJECT_ROOT, sp[2]),
            line: sp[3],
            pos: sp[4],
            file: path.basename(sp[2]),
            stack: stacklist.join('\n')
        }
    }
}

//Generic Error Handling for uncaught errors
process.on('uncaughtException', function (er) {
    var output = er.stack.split('\n').join(' - ');
    logger.error(output)

})

//logger.add(slackWinston, options)
logger.exitOnError = false;
//module.exports = logger;
