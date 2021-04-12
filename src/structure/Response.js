/**
 * Represents a http request response.
 * 
 * @returns {Response}
 */
class Response {
  constructor (response) {
    /**
     * The raw http response returned after request.
     */
    this.rawResponse = response;

    /**
     * The buffer of the request body.
     */
    this.body = Buffer.alloc(0);

    /**
     * The response headers.
     * 
     * @type {object}
     */
    this.headers = response.headers;

    /**
     * The status code of the response.
     */
    this.statusCode = response.statusCode;
  }

  /**
   *Used internally, appends a chunck of the body to the request body.
   * 
   * @param {any} chunk - The apended chunk.
   */
  appendChunk (chunk) {
    this.body = Buffer.concat([this.body, chunk]);
  }

  /**
   * Returns the body as a json object.
   * 
   * @returns {object} The JSON object.
   */
  get json () {
    return JSON.parse(this.body);
  }

  /**
   * Returns the body as plain text.
   * 
   * @returns {string} The plain text.
   */
  get text () {
    return this.body.toString();
  }
}

module.exports = Response;