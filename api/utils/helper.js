const CONSTANTS = require('./constants');

const isValidUser = (email, password) => {
  return email === CONSTANTS.DUMMY_USER.email && password === CONSTANTS.DUMMY_USER.password;
}

module.exports = {
  isValidUser
}