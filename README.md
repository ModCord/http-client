# http-client
A lightweight &amp; fast library that offers a layer of abstraction over the native http agent.
# example
A single example to get your started.

**The following code is not quite valid javascript, it's only made to showcase the constructor features and response values, however it is close.**
```js
const { Request } = require("mc-http-request");
const httpRequest = new Request("https://example.com/api", "get") // You can set up an url which you can navigate later, and specify the method, to modify it later you can use setMethod, defaults to get. 
  .setMethod("post")
  .path("/users/list") // This will make url become https://example.com/api/users/list, you can also use dots to modify the path like you would in a file.
  .header({
    "Content-Type": "application/json",
    "User-Agent": "MyApp"
  }) // Set multiple dummie headers.
  .header("Authorization", "Bearer VerySecretTokenHere") // Set up a single header.
  .query({
    "max-users": 30,
    "pages": 2
  }) // Sets multiple dummie query.
  .query("show-names", false) // Set up a single query param.
  .stream(false) // Does not return a response stream.
  .setMaxBufferSize(6000) // Sets the maximum response body size in bytes.
  .timeout(30000) // Will wait 30 seconds before closing connection.
  .compression(true) // Accept compressed responses
  .body({
    "ids": ["23", "68", "20", "45", "78"]
  }) // Sets up a json body (auto-detected).
  .body({
    "users": "23,68,20,45,78"
  }, "form") // Sets up a form encoded body.
  .body(Buffer.from("your content i don't know")) // Sets up a binary encoded body. (auto-detected)
  .body("text-here-wth", "text-plain-text - besides form, json and buffer - the library doesn't care but you need to set up Content-Type accordingly yourself")
  .send(); // Send the request, you will receive a Promise<Response>

httpRequest.then((response) => console.log(response));
// Example response:
// Response {
//     rawResponse: Response {...},
//     body: <Buffer 5b 0a 20 20 7b 0a 20 20 20 20 22 75 73 65 72 49 64 22 3a 20 31 2c 0a 20 20 20 20 22 69 64 22 3a 20 31 2c 0a 20 20 20 20 22 74 69 74 6c 65 22 3a 20 22 ... 27470 more bytes>,
//     headers: {
//       date: 'Mon, 12 Apr 2021 13:41:59 GMT',
//       'content-type': 'application/json; charset=utf-8',
//       'transfer-encoding': 'chunked',
//       connection: 'close',
//       'set-cookie': [
//         '__cfduid=d98aab4610a27b1e66928afab38a2d0371618234919; expires=Wed, 12-May-21 13:41:59 GMT; path=/; domain=.typicode.com; HttpOnly; SameSite=Lax'
//       ],
//       'x-powered-by': 'Express',
//       'x-ratelimit-limit': '1000',
//       'x-ratelimit-remaining': '999',
//       'x-ratelimit-reset': '1618162921',
//       vary: 'Origin, Accept-Encoding',
//       'access-control-allow-credentials': 'true',
//       'cache-control': 'max-age=43200',
//       pragma: 'no-cache',
//       expires: '-1',
//       'x-content-type-options': 'nosniff',
//       etag: 'W/"6b80-Ybsq/K6GwwqrYkAsFxqDXGC7DoM"',
//       via: '1.1 vegur',
//       'cf-cache-status': 'HIT',
//       age: '12354',
//       'cf-request-id': '0967ea61ed00002bca5106b000000001',
//       'expect-ct': 'max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"',
//       'report-to': '{"endpoints":[{"url":"https:\\/\\/a.nel.cloudflare.com\\/report?s=AuLigRsdfHTuksvUJcmtEIAGX0szkLma%2BSYGU88REcopYxEreJX6ITlznSmjS0JOc%2FCUeyGyuf5RYdo3yNx439lcqKMJLiNHsspzp3d74CezmnpoyI0iq84xK3bn"}],"max_age":604800,"group":"cf-nel"}',
//       nel: '{"max_age":604800,"report_to":"cf-nel"}',
//       server: 'cloudflare',
//       'cf-ray': '63ece01648212bca-FRA',
//       'alt-svc': 'h3-27=":443"; ma=86400, h3-28=":443"; ma=86400, h3-29=":443"; ma=86400'
//     },
//     statusCode: 200
//   }

httpRequest.then((response) => console.log(response.json)); // Has a JSON getter to parse the response body to javascript.

// {
//  users: [{...}, {...}]
//  count: 30
// }

httpRequest.then((response) => console.log(response.text)); // Has a text getter to parse the body into a text string.

// {"users":[{...},{...}],count:30}
