# Outlogger

A lightweight Node.js library to intercept and log all outgoing `http`, `https`, and `fetch` requests—including those made by popular libraries like Axios, node-fetch, got, and request.

Think of it as "morgan" for outgoing requests.

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
const { outlogger, restore } = require('outlogger')

// Start logging outgoing requests
outlogger({
  verbose: true, // logs method, URL, headers, and body
  // params: true, // log query params
  // body: true,   // log request body
  // headers: true // log headers
})

// Make requests with axios, fetch, http, or https...

// Stop logging and restore original functions
restore()
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
