import {type} from "os";

const mysql = require('mysql2/promise');
const bluebird = require('bluebird');
const exit = require('../services/exit');
const auth = require('./auth');

const userService = require('../services/service.user');

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
      console.log('user.get', proxy);
      switch (proxy[0]) {
        case 'admin':
          if (!auth.checkAdmin(con, userID)) {
            exit.exit401(cb, con);
          }
          break;
        default:
          result = await userService.getUser(con, userID);

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
      console.log('user.post', proxy);
      switch (proxy[0]) {
        case 'admin':
          if (!auth.checkAdmin(con, userID)) {
            exit.exit401(cb, con);
          }
          break;
        case 'register':
          result = await userService.register(con, body);
          if (typeof result === 'string') {
            exit.exit500con(cb, result, con);
          } else {
            await exit.exit200jwt(cb, con, result);
          }
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

export const register = async (event, context, cb) => {
  try {
    const con = await mysql.createConnection(rdbInfo);
    try {
      const body = JSON.parse(event.body);
      let result = 'No Path Found';
      result = await userService.register(con, body);
      if (typeof result === 'string') {
        exit.exit500con(cb, result, con);
      } else {
        await exit.exit200jwt(cb, con, result);
      }
    } catch (e) {
      await exit.exit500con(cb, e, con);
    }
  } catch (e) {
    exit.exit500(cb, e);
  }
};

export const authUser = async (event, context, cb) => {
  try {
    const con = await mysql.createConnection(rdbInfo);
    try {
      const body = JSON.parse(event.body);
      let result = 'No Path Found';
      let proxy = [];
      if (event.pathParameters && event.pathParameters.proxy) {
        proxy = event.pathParameters.proxy.split('/');
      }
      console.log('user.auth', proxy);
      result = await userService.authenticate(con, body);
      if (typeof result === 'string') {
        exit.exit401(cb, con, result);
      } else {
        await exit.exit200jwt(cb, con, result);
      }
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
      console.log('user.put', proxy);
      switch (proxy[0]) {
        case 'admin':
          if (!auth.checkAdmin(con, userID)) {
            exit.exit401(cb, con);
          }
          break;
        case 'image':
          result = await userService.updateUserImage(con, userID, body);
          if (typeof result === 'string') {
            exit.exit500con(cb, result, con);
          } else {
            await exit.exit200(cb, con, result);
          }
          break;
        case 'password':
          result = await userService.updateUserPass(con, userID, body);
          if (typeof result === 'string') {
            exit.exit500con(cb, result, con);
          } else {
            await exit.exit200(cb, con, result);
          }
          break;
        default:
          result = await userService.updateUser(con, userID, body);
          if (typeof result === 'string') {
            exit.exit500con(cb, result, con);
          } else {
            await exit.exit200(cb, con, result);
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
      console.log('user.del', proxy);
      switch (proxy[0]) {
        case 'admin':
          if (proxy[1] && !isNaN(proxy[1])) {
            result = await userService.deleteUser(con, proxy[1]);
          }
          break;
        default:
          result = await userService.deleteUser(con, userID);
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
