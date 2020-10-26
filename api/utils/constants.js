const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true
}

const HTTP_STATUS_CODES = {
  OK: 200,
  BAD_INPUT: 400,
  INTERNAL_SERVER_ERROR: 500
}

const DUMMY_USER = {
  email: 'admin',
  password: 'secret'
}

module.exports = {
  CORS_HEADERS,
  DUMMY_USER,
  HTTP_STATUS_CODES
}