// index.d.ts

/// <reference types="node" />

export interface LogOptions {
  /**
   * Enable or disable logging.
   * @default true
   */
  enable?: boolean

  /**
   * Include query parameters in the log.
   * @default false
   */
  params?: boolean

  /**
   * Include request body in the log.
   * @default false
   */
  body?: boolean

  /**
   * Include headers in the log.
   * @default false
   */
  headers?: boolean

  /**
   * Enable all logging: params, body, and headers.
   * @default false
   */
  verbose?: boolean
}

/**
 * Monkey-patches HTTP, HTTPS, and fetch to log outgoing requests.
 * Call this once to start logging.
 *
 * @param options Configuration for what to log
 */
export function outlogger(options?: LogOptions): void

/**
 * Restores the original HTTP, HTTPS, and fetch methods.
 */
export function restore(): void
