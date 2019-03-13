const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const iterations = 10000;

// Function to generate a secure password hash.
export const generatePasswordHash = async (password) => {
  // console.log('password', password);
  const salt = new Buffer(process.env.SALT, 'hex');

  const keyStr = await crypto.pbkdf2Async(password, salt, iterations, 64, 'sha1');

  const key = new Buffer(keyStr, 'hex');
  const hash = 'pbkdf2$' + iterations +
    '$' + key.toString('hex') +
    '$' + salt.toString('hex');

  return hash;
};

export const verifyPasswordHash = async (password, hashedPassword) => {
  const key = hashedPassword.split('$');
  if(key.length !== 4 || !key[2] || !key[3] || key[0] !== 'pbkdf2' || key[1] !== iterations.toString()) return false;
  const newHash = await this.generatePasswordHash(password);
  return (newHash !== hashedPassword);

}