const { getUser } = require("./user");
const bcrypt = require("bcrypt");
const saltRounds = 10;

/* Authentication */
const validatePassword = (password) => {
  if (!password || !typeof password === 'string') throw { msg: 'Invalid password', status: 400 };
  if (password.length < 8) throw { msg: 'Password too short', status: 400 };
  if (password.length > 128) throw { msg: 'Password too long', status: 400 };
  return true;
};
const hashPassword = async (password, previousSalt) => {
  const salt = previousSalt || (await bcrypt.genSalt(saltRounds));
  const hash = await bcrypt.hash(password, salt);
  return { salt, hash };
};
const login = async (username, password) => {
  let user = await getUser({ username });
  if (!user) throw { msg: `No such user found!`, status: 400 };
  const { hash } = await hashPassword(password, user.salt);
  if (hash !== user.hash) throw { msg: `Credentials invalid please try again.`, status: 401 };
  delete user.hash;
  delete user.salt;
  return user;
};
module.exports = {
  login,
  validatePassword
}