const { Request, Response } require("./src/index.js");

module.exports = {
  request: (...args) => return new Request(...args),
  Request,
  Response
}
