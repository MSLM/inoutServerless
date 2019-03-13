const mysql = require('mysql2/promise');
const bluebird = require('bluebird');
const exit = require('../services/exit');
const moment = require('moment');

const settingsService = require('../services/service.settings');

// env from env.yml
const rdbInfo = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE,
  promise: bluebird
};


export const get = async (event, context, cb) => {
  try {
    const con = await mysql.createConnection(rdbInfo);
    try {
      const userID = event.requestContext.authorizer.principalId;
      let result = 'No Path Found';
      let proxy = [];
      if (event.pathParameters && event.pathParameters.proxy) {
        proxy = event.pathParameters.proxy.split('/');
      }
      console.log('settings.get', proxy);
      switch (proxy[0]) {
        default:
          result = await settingsService.get(con, userID);
          break;
      }
      exit.exit200(cb, con, result);
    } catch (e) {
      await exit.exit500con(cb, e, con);
    }
  } catch (e) {
    exit.exit500(cb, e);
  }
};

export const put = async (event, context, cb) => {
  try {
    const con = await mysql.createConnection(rdbInfo);
    try {
      const userID = event.requestContext.authorizer.principalId;
      const body = JSON.parse(event.body);
      let result = 'No Path Found';
      let proxy = [];
      if (event.pathParameters && event.pathParameters.proxy) {
        proxy = event.pathParameters.proxy.split('/');
      }
      console.log('settings.put', proxy);
      switch (proxy[0]) {
        case 'day':
          const dayID = proxy[1];
          result = await settingsService.update(con, userID, dayID, body);
          break;
        default:
          break;
      }
      exit.exit200(cb, con, result);
    } catch (e) {
      await exit.exit500con(cb, e, con);
    }
  } catch (e) {
    exit.exit500(cb, e);
  }
};



