# Outlogger

[![npm version](https://img.shields.io/npm/v/outlogger)](https://www.npmjs.com/package/outlogger)
[![license](https://img.shields.io/npm/l/outlogger)](https://github.com/ramkumar2098/outlogger/blob/master/LICENSE)
[![downloads](https://img.shields.io/npm/dm/outlogger)](https://www.npmjs.com/package/outlogger)

Log outgoing network requests.

A lightweight Node.js library that intercepts and logs all outgoing `http`, `https`, and `fetch` requests — including API calls made by SDKs.

> **Note:** This library monkey-patches core modules. Use with caution in production environments.

## Why?

Existing tools and devtools don't provide a simple way to log outgoing requests. This package fills that gap for debugging and development.

## When to Use

- Your app makes many third-party API/SDK calls and you want to track them.
- You need visibility into all outgoing HTTP traffic for debugging.

## Installation

```bash
npm install outlogger
```

## Usage with Axios

```js
const axios = require('axios')
const { outlogger, restore } = require('outlogger')

// Start logging outgoing requests
outlogger({ verbose: true })

// Make requests with axios, fetch, http, or https...
await axios.get('https://jsonplaceholder.typicode.com/posts/1')

// Optionally, stop logging and restore original functions
// Call restore() if you want to revert monkey-patching
restore()
```

### Output

```bash
GET https://jsonplaceholder.typicode.com/posts/1 - Headers: {"Accept":"application/json, text/plain, */*","User-Agent":"axios/1.11.0","Accept-Encoding":"gzip, compress, deflate, br"}
```

## Usage with an SDK

```js
const { tavily } = require('@tavily/core') // Example SDK
const { outlogger, restore } = require('outlogger')

outlogger({ verbose: true })

const client = tavily({ apiKey: process.env.TAVILY_API_KEY })

// tavily makes an API call behind the scenes
await client.search('site:google.com latest sports news', {
  max_results: 3,
})
```

### Output

```bash
POST https://api.tavily.com/search - Body: {"query":"site:google.com latest sports news","max_results":3} - Headers: {"Accept":"application/json, text/plain, */*","Content-Type":"application/json","Authorization":"<your-api-key>","X-Client-Source":"tavily-js","User-Agent":"axios/1.11.0","Content-Length":"62","Accept-Encoding":"gzip, compress, deflate, br"}
```

## Configuration Options

| Option    | Type    | Default | Description                         |
| --------- | ------- | ------- | ----------------------------------- |
| `verbose` | boolean | false   | Log headers, body, and query params |
| `params`  | boolean | false   | Log query parameters only           |
| `body`    | boolean | false   | Log request body only               |
| `headers` | boolean | false   | Log headers only                    |

## Features

- Logs HTTP method, URL, headers, and body (configurable).
- Supports `http`, `https`, and `fetch`.
- Compatible with Axios, node-fetch, got, and native Node APIs.
- Simple `restore()` to revert monkey-patching.

## Limitations & Warnings

- **Monkey-patching:** May interfere with other libraries that also patch these modules.
- **Performance:** Logging large bodies can impact performance.
- **Production use:** This library is intended for development and debugging, not for production-critical environments.

## License

MIT © 2025  
[View LICENSE](https://github.com/ramkumar2098/outlogger/blob/master/LICENSE)
