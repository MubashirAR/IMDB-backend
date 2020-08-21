let User = require('../dbConnection').models.User;
const getUser = ({ username }) => {
  return User.findOne({ email: username }).lean().exec();
};

module.exports = { getUser }