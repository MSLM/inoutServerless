const mysql = require('mysql2/promise');
const bluebird = require('bluebird');
const exit = require('../services/exit');
const auth = require('./auth');
const moment = require('moment');

const areaService = require('../services/service.area');

// env from serverless.yml
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
      const areaID = proxy[0];
      console.log('area.get', proxy);
      switch (proxy[1]) {
        case 'note':
          result = await areaService.getNoteHistory(con, userID, areaID);
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

export const post = async (event, context, cb) => {
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
      console.log('area.post', proxy);
      switch (proxy[0]) {
        default:
          if (!proxy[0]) {
            result = await areaService.add(con, userID, body);
          }
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
      console.log('area.put', proxy);
      switch (proxy[0]) {
        case 'sort':
          result = await areaService.sortArea(con, userID, body);
          break;
        default:
          if (proxy[0] && !isNaN(proxy[0])) {
            const areaID = proxy[0];
            switch (proxy[1]) {
              case 'note':
                result = await areaService.saveNote(con, userID, areaID, body.note);
                break;
              case 'sort':
                result = await areaService.sort(con, userID, areaID, body);
                break;
            }
          }
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

export const del = async (event, context, cb) => {
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
      console.log('area.del', proxy);
      switch (proxy[0]) {
        default:
          if (!isNaN(proxy[0])) {
            result = areaService.remove(con, userID, proxy[0]);
          }
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



