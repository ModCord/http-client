const { URL } = require("url");
const { join } = require("path");
const queryString = require("querystring");
const Response = require("./Response");
const  { createGunzip, createInflate } = require("zlib");
const http = require("http");
const https = require("https");

/**
 * Represents a http request.
 * 
 * @returns {Request} A new http requests.
 */
class Request {
  /**
   * @param {string} url - The url which request is sent to.
   * @param {string} method - The method used for this url.
   */
  constructor (url, method = "get") {
    /**
     * The url interface the request is made to.
     * 
     * @type {URL}
     */
    this.url = new URL(url);

    /**
     * The method used to make this request, "get" by default.
     * 
     * @type {string}
     */
    this.method = method;

    /**
     * The headers sent with the request, none by default.
     * 
     * @type {object}
     */
    this.headers = {};

    /**
     * The data sent with the request.
     * 
     * @type {object|null}
     */
    this.data = null;

    /**
     * The format the data is sent in, none by default.
     * 
     * @type {string}
     */
    this.dataEncoding = null;

    /**
     * Whether to accept compression or not, disabled by default.
     * 
     * @type {boolean}
     */
    this.acceptCompression = false;

    /**
     * Whether to accept streams of data or not in the response, disabled by default.
     * 
     * @type {boolean}
     */
    this.streams = false;

    /**
     * Max buffer size of a response (in MB), limitless by default.
     * 
     * @type {number}
     */
    this.maxBufferSize = null;

    /**
     * The maximum amount of time in which the http client will await a response, idefinetely by default.
     * 
     * @type {number}
     */
    this.responseTimeout = 0;

    /**
     * The supported compression formats.
     */
    Object.defineProperty(this, "supportedCompressions", ["gzip", "deflate"]);
    return this;
  }

  /**
   * Change the path based on the base url provided in the constructor.
   * 
   * @param {string} relativePath - The relative path the request should be made to, based on the base url provided in the constructor.
   * @returns {Request} Returns the request itself.
   */
  path (relativePath) {
    this.url.pathname = join(this.url.pathname, relativePath);
    return this;
  }

  /**
   * Sets the `Request.streams` parameter;
   * 
   * @param {boolean} acceptStream - Whether to accept streams of data or not in the response.
   * @returns {Request} Returns the request itself.
   */
  stream (acceptStream) {
    this.streams = acceptStream;
    return this;
  }

  /**
   * Sets the method.
   * 
   * @param {number} method The maximum size for the http request response.
   * @returns {Request} An instance of itself.
   */
  method (method) {
    this.method = method;
    return this;
  }

  /**
   * Set up the maximum size for this http request.
   * 
   * @param {number} size The maximum size for the http request response.
   * @returns {Request} An instance of itself.
   */
  maxBufferSize (size) {
    this.maxBufferSize = size;
    return this;
  }

  /**
   * Sets the `Request.acceptCompression` parameter;
   * 
   * @param {boolean} acceptCompression - Whether to accept compressed responses or not.
   * @returns {Request} Returns the request itself.
   */
  compression (acceptCompression) {
    this.acceptCompression = acceptCompression;
    return this;
  }

  /**
   * Sets the `Request.responseTimeout` parameter;
   * 
   * @param {boolean} timeout -The amount of time to wait. 
   * @returns {Request} Returns the request itself.
   */
  timeout (timeout) {
    this.responseTimeout = timeout;
    return this;
  }

  /**
   * Sets the headers for this request.
   * 
   * @param {string|object} content - A header name, or an object containing an object with the request headers. 
   * @param {string} value - The value of the header, if it's a name provided as the first argument.
   * @returns {Request} Returns the request itself.
   */
  header (content, value) {
    if (this._is("object", content)) {
      Object.assign(this.headers, content);
    } else {
      this.headers[content] = value;
    }
    return this;
  }

  /**
   * Sets the search params for this request.
   * 
   * @param {string|object} content - A param name, or an object containing an object with the params. 
   * @param {string} value - The value of the param, if it's a name provided as the first argument.
   * @returns {Request} Returns the request itself.
   */
  query (content, value) {
    if (this._is("object", content)) {
      for (const param of Object.keys(content)) {
        this.url.searchParams.append(param, content[param]);
      }
    } else {
      this.url.searchParams.append(content, value);
    }
    return this;
  }

  /**
   * Sets up the body's data
   * 
   * @param {object|Buffer} data - The data to send with this request, an object or a buffer.
   * @param {string} encoding - The way to encode data, `json`, `form`, `buffer`, if you have a json or a buffer you may ommit specifying this.
   * @returns {Request} The request itself. 
   */
  body (data, encoding = "auto") {
    if (encoding === "auto") this.dataEncoding = this._is("object", data) && !Buffer.isBuffer(data) ? "json" : (Buffer.isBuffer(data) ? "buffer" : null);
    else this.dataEncoding = encoding;
    if (!this.dataEncoding) throw new Error("Cannot guess the data encoding, the available types are `json`, `form` or `buffer`.");
    this.data = this.dataEncoding === "json" ? JSON.stringify(data) : (this.dataEncoding === "form" ? queryString.stringify(data) : data);
    return this;
  }
  
  send () {
    return new Promise((resolve, reject) => {
      if (this.data) {
        if (!this._has("content-type", this.headers)) {
          if (this.dataEncoding === "json") this.headers["content-type"] = "application/json";
          else if (this.dataEncoding === "form") this.headers["content-type"] = "application/x-www-form-urlencoded";
        }
      
        if (!this._has("content-length")) this.headers["content-length"] = Buffer.byteLength(this.data);
        if (this.acceptCompression && !this._has("accept-encoding", this.headers)) this.headers["accept-encoding"] = this.supportedCompressions.join(", ");
      }

      const requestOptions = {
        "protocol": this.url.protocol,
        "host": this.url.hostname,
        "port": this.url.port,
        "path": this.url.pathname + (this.url.search === null ? "" : this.url.search),
        "method": this.method,
        "headers": this.headers
      };

      let request;

      if (this.url.protocol === "http:") {
        request = http.request(requestOptions, (response) => this._handleResponse(response, resolve, reject));
      } else if (this.url.protocol === "https:") {
        request = https.request(requestOptions, (response) => this._handleResponse(response, resolve, reject));
      } else throw new Error("Invalid protocol.");

      if (this.responseTimeout) {
        request.setTimeout(this.responseTimeout, () => {
          request.abort();
        });

        if (!this.streams) reject(new Error("Request imeout has been reached."));
      }

      if (this.data) request.write(this.data);
      request.end();
    });
  }

  /**
   * Used internally, handles a request response.
   * 
   * @param {any} response A request response.
   * @param {any} resolve A promise resolve function.
   * @param {any} reject A promise reject function.
   */
  _handleResponse (response, resolve, reject) {
    let responseStream = response;

    if (this.acceptCompression) {
      if (response.headers["content-encoding"] === "gzip") responseStream = response.pipe(createGunzip());
      else if (response.headers["content-encoding"] === "deflate") responseStream = response.pipe(createInflate());
    }

    let responseStructure;

    if (this.streams) resolve(responseStream);
    else {
      responseStructure = new Response(response);

      responseStream.on("error", reject);
      responseStream.on("data", (chunk) => {
        responseStructure.appendChunk(chunk);
        
        if (this.maxBufferSize && responseStructure.body.length > this.maxBufferSize) {
          responseStream.destroy();
          reject(`Received a response which was longer than acceptable maximum buffer size which is ${this.maxBufferSize} bytes.`);
        }
      });
      responseStream.on("end", () => resolve(responseStructure));      
    }
  }

  /**
   * Tests if the value is of type.
   * 
   * @param {string} type - The type to test for.
   * @param {any} value - The value to test. 
   * @returns {boolean} Whether the value is of property.
   */
  _is (type, value) {
    return typeof value === type; 
  }

  /**
   * Tests if the target value has the propery.
   * 
   * @param {string} property - The property to test for.
   * @param {object} value - The value to test. 
   * @returns {boolean} Whether the value is of property.
   */
  _has (property, value) {
    return !!property[value];
  }
}

module.exports = Request;
