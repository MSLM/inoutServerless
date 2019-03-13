const mysql = require('mysql2/promise');
const bluebird = require('bluebird');
const exit = require('../services/exit');
const moment = require('moment');

const scheduleService = require('../services/service.schedule');

// env from env.yml
const rdbInfo = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE,
  promise: bluebird
};

export const getPublic = async (event, context, cb) => {
  try {
    const con = await mysql.createConnection(rdbInfo);
    try {
      let result = 'No Path Found';
      let proxy = [];
      if (event.pathParameters && event.pathParameters.proxy) {
        proxy = event.pathParameters.proxy.split('/');
      }

      console.log('schedule.getPublic', proxy);

      let startDate = proxy[0];
      let endDate = proxy[1];
      const userID = proxy[2];

      if (!startDate) {
        startDate = moment().tz('America/Los_Angeles').format('YYYY-MM-DD');
        endDate = moment().tz('America/Los_Angeles').add(6, 'days').format('YYYY-MM-DD');
      }

      if (userID) {
        result = scheduleService.getPublicUser(con, startDate, endDate, userID);
      } else {
        result = scheduleService.getPublic(con, startDate, endDate);
      }

      exit.exit200(cb, con, result);
    } catch (e) {
      await exit.exit500con(cb, e, con);
    }
  } catch (e) {
    exit.exit500(cb, e);
  }
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
      const scheduleID = proxy[0];
      console.log('schedule.get', proxy);
      switch (proxy[1]) {
        case 'note':
          result = await scheduleService.getNoteHistory(con, userID, scheduleID);
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
      console.log('schedule.post', proxy);
      switch (proxy[0]) {
        default:
          if (!proxy[0]) {
            result = await scheduleService.add(con, userID, body);
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
      console.log('schedule.put', proxy);
      switch (proxy[0]) {
        case 'sort':
          result = await scheduleService.sortSchedule(con, userID, body);
          break;
        default:
          if (proxy[0] && !isNaN(proxy[0])) {
            const scheduleID = proxy[0];
            switch (proxy[1]) {
              case 'note':
                result = await scheduleService.saveNote(con, userID, scheduleID, body.note);
                break;
              case 'sort':
                result = await scheduleService.sort(con, userID, scheduleID, body);
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
      console.log('schedule.del', proxy);
      switch (proxy[0]) {
        default:
          if (!isNaN(proxy[0])) {
            result = scheduleService.remove(con, userID, proxy[0]);
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



