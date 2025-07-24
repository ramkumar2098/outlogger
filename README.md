# Outlogger

Log outgoing network requests.

A lightweight Node.js library to intercept and log all outgoing `http`, `https`, and `fetch` requests. Works with popular libraries like Axios, node-fetch, got, and request.

> **Note:** This library monkey-patches core modules. Use with caution in production environments.

## Why?

Existing tools and devtools do not provide a simple way to log outgoing requests from all libraries. This package fills that gap for debugging and development.

## When to Use

- Your app makes many third-party API/SDK calls and you want to track them.
- You need visibility into all outgoing HTTP traffic for debugging.

## Installation

```bash
npm install outlogger
```

## Usage

```js
const axios = require('axios')
const { outlogger, restore } = require('outlogger')

// Start logging outgoing requests
outlogger({
  verbose: true, // logs params, body, and headers
  // params: true, // log query params
  // body: true,   // log request body
  // headers: true // log headers
})

// Make requests with axios, fetch, http, or http...
await axios.get('https://jsonplaceholder.typicode.com/posts/1')

// Optionally, stop logging and restore original functions
// Call restore() if you want to revert monkey-patching
// restore()
```

## Output

```bash
GET https://jsonplaceholder.typicode.com/posts/1 - Headers: {"Accept":"application/json, text/plain, */*","User-Agent":"axios/1.11.0","Accept-Encoding":"gzip, compress, deflate, br"}
```

## Features

- Logs HTTP method, URL, headers, and body (configurable)
- Supports `http`, `https`, and `fetch`
- Compatible with Axios, node-fetch, got, and native Node APIs
- Simple `restore()` to revert monkey-patching

## Limitations & Warnings

- **Monkey-patching:** May interfere with other libraries that patch these modules
- **Performance:** Logging large bodies may impact performance
- **Production use:** Designed for debugging/dev, not recommended for production-critical environments

## License

MIT © 2025
