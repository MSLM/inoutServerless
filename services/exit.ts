const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');

// Clean exit returning the user information
export const exit200jwt = async (cb, con, user) => {
  const payload = JSON.parse(JSON.stringify(user));
  delete payload.password;
  payload.iat = Math.floor(Date.now() / 1000) + parseInt(process.env.JWT_TIME);
  const token = jwt.sign(payload, process.env.JWT_KEY);
  const refreshToken = randomstring.generate(50);
  let success = true;
  try {
    // Validate that this is a valid token before passing it back
    jwt.verify(token, process.env.JWT_KEY); // throws on invalid token

    //Add refresh token to DB for this user
    const sql = `insert into userToken (userID, refreshToken) values (${user.id}, '${refreshToken}')`;
    await con.execute(sql);
  } catch (e) { // e.g. "data is not a valid scrypt-encrypted block"
    success = false;
    console.log('error', e);
  }

  if (!success) {
    con.close();
    cb(null, 'Error found, check logs.');
  } else {
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS,
        "Access-Control-Allow-Headers": "Authorization"
      },
      body: JSON.stringify({
        jwt: token,
        refreshToken: refreshToken,
        user: user
      }),
    };
    con.close();
    cb(null, response);
  }
};

export const exit200 = (cb, con, body) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS,
      "Access-Control-Allow-Headers": "Authorization"
    },
    body: JSON.stringify(body),
  };
  con.close();
  cb(null, response);
};

// Unauthorized Error Exit
export const exit401 = (cb, con, message = 'User/Pass not found') => {

  const response = {
    statusCode: 401,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS,
      "Access-Control-Allow-Headers": "Authorization"
    },
    body: JSON.stringify({
      message: message
    }),
  };
  con.close();
  cb(null, response);
};

// General Error Exit
export const exit500 = (cb, e) => {
  console.log('500 - ' + e);
  const response = {
    statusCode: 500,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS,
      "Access-Control-Allow-Headers": "Authorization"
    },
    body: JSON.stringify({
      message: e
    }),
  };
  cb(null, response);
};

export const exit500con = (cb, e, con) => {
  console.log('500con - ', e);
  const response = {
    statusCode: 500,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS,
      "Access-Control-Allow-Headers": "Authorization"
    },
    body: JSON.stringify({
      message: e
    }),
  };
  con.close();
  cb(null, response);
};
