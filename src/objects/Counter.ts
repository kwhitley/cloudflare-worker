import { DurableObject } from 'cloudflare:workers'
import { IttyDurable } from './IttyDurable'

const DEFAULTS = {
  value: 0,
  persisted: { counter: 0 },
}

let value = 400

const externalStore = {
  get() {
    return { counter: value }
  },
  put(newValue) {
    console.log('setting value of this', this, 'to', newValue)
    value = newValue
  }
}

export class Counter extends IttyDurable {
  // anything here is in-memory only
  value = 0

  store = externalStore

  // store = {
  //   get: () => ({ counter: 200 }),
  //   put: (value) => {}
  // }

  // anything here is persisted
  persisted = {
    counter: 0,
  }

  test1(...messages: string[]) {
    console.log('test 1', messages)
  }

  add(a: number, b: number) {
    return a + b
  }

  async increment(by = 1) {
    this.value += Number(by)
    this.persisted.counter++

    return this.toJSON()
  }

  reset() {
    Object.assign(this, DEFAULTS)

    return this.toJSON()
  }
}
