export class AsyncLocalStorage<T> {
  #store: T | undefined

  run<R>(store: T, callback: () => R): R {
    const previousStore = this.#store
    this.#store = store

    try {
      return callback()
    } finally {
      this.#store = previousStore
    }
  }

  getStore(): T | undefined {
    return this.#store
  }
}
