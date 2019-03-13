const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const bluebird = require('bluebird');
const pw = require('./password');
const exit = require('../services/exit');

// env from serverless.yml
const rdbInfo = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE,
  promise: bluebird
}

export const checkAdmin = async (con, userID) => {
  const [[user]] = await con.query('select userRoleID from user where id = ?', [userID]);
  return user.userRoleID >= 2;
}
// Gatekeeper function to check the JWT and apply access to the requested function
export const authorize = (event, context, cb) => {
  // Close the function when finished with main processing
  context.callbackWaitsForEmptyEventLoop = false;

  //console.log('event', event)
  if (!event.authorizationToken) {
    console.log(event);
    return cb('Unauthorized');
  }

  const tokenParts = event.authorizationToken.split(' ');
  const tokenValue = tokenParts[1];
  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    // no auth token!
    console.log('Unauthorized: no token');
    return cb('Unauthorized');
  }

  try {
    jwt.verify(tokenValue, process.env.JWT_KEY, (verifyError, decoded) => {
      if (verifyError) {
        console.log('verifyError', verifyError);
        // 401 Unauthorized
        console.log(`Token invalid. ${verifyError}`);
        return cb('Unauthorized');
      }
      // is custom authorizer function
      console.log('valid from customAuthorizer', decoded);
      console.log(event.methodArn);
      const policy = generatePolicy(decoded.id, 'Allow', event.methodArn);
      console.log(policy.policyDocument['Statement']);
      return cb(null, policy)
    })
  } catch (err) {
    console.log('catch error. Invalid token', err);
    return cb('Unauthorized');
  }
};

// Gatekeeper function for admin functions
export const authorizeAdmin = (event, context, cb) => {
  // Close the function when finished with main processing
  context.callbackWaitsForEmptyEventLoop = false;

  //console.log('event', event)
  if (!event.authorizationToken) {
    return cb('Unauthorized');
  }

  const tokenParts = event.authorizationToken.split(' ');
  const tokenValue = tokenParts[1];
  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    // no auth token!
    return cb('Unauthorized');
  }

  try {
    jwt.verify(tokenValue, process.env.JWT_KEY, (verifyError, decoded) => {
      if (verifyError) {
        console.log('verifyError', verifyError);
        // 401 Unauthorized
        console.log(`Token invalid. ${verifyError}`);
        return cb('Unauthorized');
      }
      if (decoded.role < 4){
        console.log(`Not sufficient privileges. ${verifyError}`);
        return cb('Unauthorized');
      }
      // is custom authorizer function
      console.log('valid from customAuthorizer', decoded);
      const policy = generatePolicy(decoded.id, 'Allow', event.methodArn);
      console.log(event.methodArn);
      console.log(policy);
      return cb(null, policy);
    })
  } catch (err) {
    console.log('catch error. Invalid token', err);
    return cb('Unauthorized');
  }
};


// Function to generate a policy to allow the user access to the requested fuction.
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {
    principalId: principalId,
    policyDocument: {}
  };
  if (effect && resource) {
    const policyDocument = {
      Version: '2012-10-17',
      Statement: []
    };
    policyDocument.Statement[0] = {
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: resource
    };
    authResponse.policyDocument = policyDocument;
  }
  return authResponse
};

// Function to pull the user information by id.
// const getFBUser = async (con, id) => {
//   const [[user]] = await con.execute("select * from user where fbID = ?", [id]);
//   user.password = undefined;
//   return user;
// };

