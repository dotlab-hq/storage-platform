export class PassThrough {
  pipe<T>(destination: T): T {
    return destination
  }

  destroy(_error?: unknown) {}

  get destroyed() {
    return false
  }
}

export class Readable {
  static fromWeb<T>(stream: T): T {
    return stream
  }

  static toWeb<T>(stream: T): T {
    return stream
  }
}
