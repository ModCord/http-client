const { test, expect } = require("@jest/globals");
const { URL } = require("url");
const { Request } = require("../index");

test("create a new request", () => {
  const request = new Request("https://jsonplaceholder.typicode.com");
  expect(request.url).toStrictEqual(new URL("https://jsonplaceholder.typicode.com"));
});

test("method assigned correctly", () => {
  const request = new Request("https://jsonplaceholder.typicode.com");
  expect(request.method).toBe("get");
});

test("set accept compression", () => {
  const request = new Request("https://jsonplaceholder.typicode.com")
    .compression(true);
  
  expect(request.acceptCompression).toBeTruthy();
});

test("set relative add path", () => {
  const request = new Request("https://jsonplaceholder.typicode.com/")
    .path("/posts");
  
  expect(request.url.href).toBe("https://jsonplaceholder.typicode.com/posts");
});

test("set relative custom path", () => {
  const request = new Request("https://jsonplaceholder.typicode.com/information/api")
    .path("../../posts");
  
  expect(request.url.href).toBe("https://jsonplaceholder.typicode.com/posts");
});

test("set timeout", () => {
  const request = new Request("https://jsonplaceholder.typicode.com/information/api")
    .timeout(5000);
  
  expect(request.responseTimeout).toBe(5000);
});

test("set max buffer size", () => {
  const request = new Request("https://jsonplaceholder.typicode.com/information/api")
    .maxBufferSize(200);

  expect(request.requestMaxBufferSize).toBe(200);
});

test("set accept stream", () => {
  const request = new Request("https://jsonplaceholder.typicode.com/information/api")
    .stream(true);
  
  expect(request.streams).toBeTruthy();
});

test("adding single header", () => {
  const request = new Request("https://jsonplaceholder.typicode.com/information/api")
    .header("My HeadeR", "my vALue");
  
  expect(request.headers).toStrictEqual({
    "My HeadeR": "my vALue"
  });
});

test("adding multiple headers", () => {
  const request = new Request("https://jsonplaceholder.typicode.com/information/api")
    .header({
      "Content-Type": "application/json",
      "Authorization": "Bearer dkgItbyikGkbY8899boNOE.hnbf6UbiujkNY8ilihUONoJynuIGmuk.nT7GiukBVftjvHNKMnbfVNJHBKMnBHKMnhVNHm"
    });
  
  expect(request.headers).toStrictEqual({
    "Content-Type": "application/json",
    "Authorization": "Bearer dkgItbyikGkbY8899boNOE.hnbf6UbiujkNY8ilihUONoJynuIGmuk.nT7GiukBVftjvHNKMnbfVNJHBKMnBHKMnhVNHm"
  });
});

test("adding multiple headers multiple times", () => {
  const request = new Request("https://jsonplaceholder.typicode.com/information/api")
    .header({
      "Content-Type": "application/json",
      "Authorization": "Bearer dkgItbyikGkbY8899boNOE.hnbf6UbiujkNY8ilihUONoJynuIGmuk.nT7GiukBVftjvHNKMnbfVNJHBKMnBHKMnhVNHm"
    })
    .header({
      "Content-Type": "form-url-encoded",
      "X-Do-Nothing": "Yes"
    });
  
  expect(request.headers).toStrictEqual({
    "Authorization": "Bearer dkgItbyikGkbY8899boNOE.hnbf6UbiujkNY8ilihUONoJynuIGmuk.nT7GiukBVftjvHNKMnbfVNJHBKMnBHKMnhVNHm",
    "Content-Type": "form-url-encoded",
    "X-Do-Nothing": "Yes"
  });
});

test("url encode one value", () => {
  const request = new Request("https://jsonplaceholder.typicode.com/information/api")
    .query("pages", 2);

    
  expect(request.url.search).toBe("?pages=2");
});

test("url encode mutiple values", () => {
  const request = new Request("https://jsonplaceholder.typicode.com/information/api")
    .query({
      "pages": 2,
      "records": false,
      "current_user": "martin"
    });

  expect(request.url.search).toBe("?pages=2&records=false&current_user=martin");
});

test("url encode mutiple values mutiple times", () => {
  const request = new Request("https://jsonplaceholder.typicode.com/information/api")
    .query({
      "pages": 2,
      "records": false,
      "current_user": "martin"
    })
    .query({
      "amount": 30,
      "log": false,
      "pages": 5
    });

  expect(request.url.search).toBe("?pages=2&records=false&current_user=martin&amount=30&log=false&pages=5");
});

test("set up a json body", () => {
  const request = new Request("https://jsonplaceholder.typicode.com/information/api")
    .body({
      "user": "ralph",
      "password": "GRG4RYe5geqrwhgewfTR754RGFSYGHsagrqwfsfp1"
    });
  
  expect(request.dataEncoding).toBe("json");
  expect(request.data).toBe(JSON.stringify(({
    "user": "ralph",
    "password": "GRG4RYe5geqrwhgewfTR754RGFSYGHsagrqwfsfp1"
  })));
});

test("set up a json body", () => {
  const request = new Request("https://jsonplaceholder.typicode.com/information/api")
    .body({
      "user": "ralph",
      "password": "GRG4RYe5geqrwhgewfTR754RGFSYGHsagrqwfsfp1"
    });
  
  expect(request.dataEncoding).toBe("json");
  expect(request.data).toBe(JSON.stringify(({
    "user": "ralph",
    "password": "GRG4RYe5geqrwhgewfTR754RGFSYGHsagrqwfsfp1"
  })));
});

test("set up a form body", () => {
  const request = new Request("https://jsonplaceholder.typicode.com/information/api")
    .body({
      "user": "gregory",
      "password": "dDEtrVTDRYTbugnubdjyfukngntUKHJBKMH4NB3k"
    }, "form");
  
  expect(request.dataEncoding).toBe("form");
  expect(request.data).toBe("user=gregory&password=dDEtrVTDRYTbugnubdjyfukngntUKHJBKMH4NB3k");
});

test("send a get succesful request", async () => {
  const request = await (new Request("https://jsonplaceholder.typicode.com/")
    .path("/posts")
    .send());
  expect(request.statusCode).toBe(200);
  expect(request.body.length).toBeGreaterThan(200);
});

test("send a get request with too large response", async () => {
  const response = await (new Request("https://jsonplaceholder.typicode.com/")
    .maxBufferSize(200)
    .send()).catch(()=>{});

  expect(response).toBeUndefined();
});
