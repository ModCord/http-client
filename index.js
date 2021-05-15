const { Request, Response } = require("./src/index.js");

module.exports = {
  request: (...args) => new Request(...args),
  Request,
  Response
}
