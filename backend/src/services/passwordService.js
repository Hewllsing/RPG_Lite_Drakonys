const crypto = require('crypto');

const HASH_ITERATIONS = 100000;
const HASH_KEY_LENGTH = 64;
const HASH_DIGEST = 'sha512';

function hashPassword(password) {

  const salt = crypto
    .randomBytes(16)
    .toString('hex');

  const hash = crypto
    .pbkdf2Sync(
      password,
      salt,
      HASH_ITERATIONS,
      HASH_KEY_LENGTH,
      HASH_DIGEST
    )
    .toString('hex');

  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {

  const [
    salt,
    storedHash
  ] = storedPassword.split(':');

  if (!salt || !storedHash) {
    return false;
  }

  const hash = crypto
    .pbkdf2Sync(
      password,
      salt,
      HASH_ITERATIONS,
      HASH_KEY_LENGTH,
      HASH_DIGEST
    )
    .toString('hex');

  const currentHashBuffer = Buffer.from(hash, 'hex');
  const storedHashBuffer = Buffer.from(storedHash, 'hex');

  if (currentHashBuffer.length !== storedHashBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    currentHashBuffer,
    storedHashBuffer
  );
}

module.exports = {
  hashPassword,
  verifyPassword
};
