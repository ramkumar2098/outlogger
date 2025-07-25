import http from 'http'
import https from 'https'

let isInitialized = false

const originalHttpRequest = http.request
const originalHttpsRequest = https.request
let originalFetch = null

function wrapAndOverrideRequest(module, protocol, userOptions) {
  const originalRequest = module.request.bind(module)

  function wrappedRequest(...args) {
    const [options, moreOptions] = args

    const req = originalRequest(...args)

    const extras = {}

    // URL object does not have method and headers.
    // for node-fetch and got.
    if (typeof options == 'string' || options instanceof URL) {
      if (moreOptions.method) {
        extras.method = moreOptions.method
      }
      if (moreOptions.headers) {
        extras.headers = moreOptions.headers
      }
    }

    logOutgoingRequest(protocol, options, req, extras, userOptions)
    return req
  }

  module.request = wrappedRequest
}

function logOutgoingRequest(protocol, options, req, extras = {}, userOptions) {
  let method = options.method || 'GET'
  let host = options.hostname || options.host || 'localhost'
  let path = options.path || '/'
  let port = options.port ? `:${options.port}` : ''
  let headers = options.headers || {}

  // remove query params from path
  if (!userOptions.logParams && path.includes?.('?')) {
    path = path.split('?')[0]
  }

  // for node-fetch and got.
  if (typeof options == 'string' || options instanceof URL) {
    const url = new URL(options)
    method = extras.method || 'GET'
    host = url.host
    path = url.pathname + (userOptions.logParams ? url.search : '')
    port = url.port
    headers = extras.headers || {}
  }

  let logStr = `${method} ${protocol}://${host}${port}${path}`

  // GET and DELETE requests do not have a body.
  if (!userOptions.logBody || method == 'GET' || method == 'DELETE') {
    if (userOptions.logHeaders) {
      logStr += ` - Headers: ${JSON.stringify(headers)}`
    }
    console.log(logStr)
    return
  }

  const bodyChunks = []

  const originalWrite = req.write.bind(req)
  const originalEnd = req.end.bind(req)

  function collectChunk(chunk, encoding) {
    if (!chunk) return

    // for if someone writes invalid body
    try {
      bodyChunks.push(
        Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding)
      )
    } catch (err) {
      console.error('[outlogger]', 'Failed to buffer chunk', err)
    }
  }

  req.write = function (chunk, encoding, callback) {
    collectChunk(chunk, encoding)
    return originalWrite(chunk, encoding, callback)
  }

  req.end = function (chunk, encoding, callback) {
    // for got library.
    if (typeof chunk == 'function') {
      callback = chunk
      chunk = null
      encoding = null
    }

    collectChunk(chunk, encoding)

    const body = Buffer.concat(bodyChunks).toString()

    try {
      const payloadObject = JSON.parse(body) // parse pretty JSON string
      const minifiedJSON = JSON.stringify(payloadObject) // convert to minified JSON
      logStr += ` - Body: ${minifiedJSON}`
    } catch (err) {
      logStr += ` - Body: ${body}` // fallback if not valid JSON
    }

    if (userOptions.logHeaders) {
      logStr += ` - Headers: ${JSON.stringify(headers)}`
    }

    console.log(logStr)

    return originalEnd(chunk, encoding, callback)
  }

  req.on('error', err => {
    console.error('[outlogger]', 'Error in request', err)
  })
}

function wrapAndOverrideFetch(userOptions) {
  if (typeof fetch != 'function') return

  if (!originalFetch) originalFetch = fetch

  function wrappedFetch(...args) {
    logOutgoingFetchRequest(userOptions, ...args)
    return originalFetch(...args)
  }

  globalThis.fetch = wrappedFetch
}

function logOutgoingFetchRequest(userOptions, resource, options = {}) {
  let method = options.method?.toUpperCase?.() || 'GET'

  let url
  let headers = new Headers()

  // normal fetch, fetch + URL object
  if (typeof resource == 'string' || resource instanceof URL) {
    url = new URL(resource)
    // options.headers will be empty for GET requests
    if (options.headers) {
      headers = new Headers(options.headers)
    }
    // normal fetch + Request object
  } else if (resource instanceof Request) {
    method = resource.method?.toUpperCase?.() || 'GET'

    url = new URL(resource.url)
    headers = new Headers(resource.headers)
    if (options.headers) {
      for (const [key, value] of new Headers(options.headers)) {
        headers.set(key, value)
      }
    }
  }

  const headersObj = Object.fromEntries(headers.entries())

  const path = url.pathname + (userOptions.logParams ? url.search : '')

  let logStr = `${method} ${url.protocol}//${url.host}${path}`

  // GET and DELETE requests do not have a body.
  if (!userOptions.logBody || method == 'GET' || method == 'DELETE') {
    if (userOptions.logHeaders) {
      logStr += ` - Headers: ${JSON.stringify(headersObj)}`
    }
    console.log(logStr)
    return
  }

  // options.body will be undefined when calling fetch with Request object
  if (options.body) {
    let body = ''
    if (typeof options.body == 'string') {
      body = options.body
    } else if (options.body instanceof FormData) {
      const bodyObj = Object.fromEntries(options.body.entries())

      body = JSON.stringify(bodyObj)
    } else {
      try {
        body = JSON.stringify(options.body)
      } catch {
        body = '[Unserializable body]'
      }
    }

    logStr += ` - Body: ${body}`
  }

  // normal fetch + Request object
  if (resource instanceof Request) {
    // reading body not supported for Request object
  }

  if (userOptions.logHeaders) {
    logStr += ` - Headers: ${JSON.stringify(headersObj)}`
  }

  console.log(logStr)
}

function logOutgoingApiCalls({
  enable = true,
  params = false,
  body = false,
  headers = false,
  verbose = false,
} = {}) {
  if (!enable) return

  if (isInitialized) {
    console.warn('[outlogger]', 'Already initialized')
    return
  }

  isInitialized = true

  const userOptions = {
    logParams: verbose || params,
    logBody: verbose || body,
    logHeaders: verbose || headers,
  }

  try {
    wrapAndOverrideRequest(http, 'http', userOptions)
    wrapAndOverrideRequest(https, 'https', userOptions)
    wrapAndOverrideFetch(userOptions)
  } catch (err) {
    console.error('[outlogger]', 'Error while initializing', err)
  }
}

function restoreOriginals() {
  if (!isInitialized) return

  http.request = originalHttpRequest
  https.request = originalHttpsRequest

  if (originalFetch) {
    globalThis.fetch = originalFetch
    originalFetch = null
  }

  isInitialized = false
}

export const outlogger = logOutgoingApiCalls
export const restore = restoreOriginals
