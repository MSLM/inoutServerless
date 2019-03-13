const pw = require('../models/password');

export const authenticate = async (con, data: {refreshToken: string; email: string; password: string}) => {

  if (data.refreshToken) {
    const [[user]] = await con.query('select id, fname, lname, image from user where id in (select userID from userToken where refreshToken = ?)', [data.refreshToken]);
    con.query('delete from userToken where refreshToken = ?', [data.refreshToken]);

    if (!user) {
      return 'Token not found.';
    }

    await con.query('insert into userLog (userID, logTime) values (?, NOW())', [user.id]);
    return user;
  } else {
    const [[user]] = await con.query('select id, fname, lname, image, password from user where email = ?', [data.email]);
    console.log('found', user);
    if (!user || !user.password){
      return 'User not found.';
    }
    try {
      if (await pw.verifyPasswordHash(data.password, user.password)){
        return null;
      }else{
        delete user.password;
        return user;
      }
    } catch (e) { // e.g. "data is not a valid scrypt-encrypted block"
      return 'System Error.';
    }
  }
};

export const register = async (con, data) => {

  const email = data.email.toLowerCase();
  const pwHash = await pw.generatePasswordHash(data.password);
  try {
    await con.query("insert into user (fname, lname, email, password, image, lastLogin) values (?, ?, ?, ?, ?, NOW())", [data.fname, data.lname, email, pwHash, data.image]);
  } catch (e) {
    return 'error';
  }
  const [[user]] = await con.query("select * from user where email = ?", [email]);
  user.password = undefined;
  return user;
};

export const updateUserImage = async (con, userID, body) => {
  if (!body.image) {
    return 'You must send the image field';
  } else {
    await con.query("update user set image = ? where id = ?", [body.image, userID]);
    const user = await getUser(con, userID);
    return user;
  }
};

export const updateUserPass = async (con, userID, body) => {
  if (!body.password) {
    return 'You must send the password field';
  } else {
    const pwHash = await pw.generatePasswordHash(body.password);
    await con.query("update user set password = ? where id = ?", [pwHash, userID]);
    const user = await getUser(con, userID);
    return user;
  }
};

export const updateUser = async (con, userID, body) => {
  const email = body.email.toLowerCase();
  await con.query(`update user 
                      set fname = ?, lname = ?, email = ?, weekBegins = ?, showYes = ?, showNo = ? 
                    where id = ?`,
    [body.fname, body.lname, email, body.weekBegins, body.showYes, body.showNo, userID]);
  const user = await getUser(con, userID);
  return user;
};

export const deleteUser = async (con, userID) => {
  await con.query("delete from userLog where userID = ?", [userID]);
  await con.query("delete from userToken where userID = ?", [userID]);
  await con.query("delete from user where id = ?", [userID]);
  const user = {};
  return user;

};

export const getUser = async (con, id) => {
  const [[user]] = await con.execute("select * from user where id = ?", [id]);
  user.password = undefined;
  return user;
};
