import { Logger } from '../Logger'

export interface RetryOptions {
  startTimeout: number
  maxRetryCount: number
}

export class ExponentialRetry {
  constructor(private options: RetryOptions, private logger?: Logger) {}

  async call<T>(fn: () => Promise<T>, name?: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let callCount = 0
      const call = () => fn().then(resolve, onError)
      const onError = (e: unknown) => {
        if (this.logger && name) {
          this.logger.error(name, e)
        }
        callCount++
        if (callCount > this.options.maxRetryCount) {
          reject(e)
        } else {
          const ms = this.options.startTimeout * 2 ** (callCount - 1)
          setTimeout(call, ms)
        }
      }
      call()
    })
  }
}
