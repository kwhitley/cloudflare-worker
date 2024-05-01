import { DurableObject } from 'cloudflare:workers'

class IttyDurable extends DurableObject {
  persisted
  #persistTimer
  #persistDelay = 5000
  #persistLoaded

  constructor(...args: any) {
    super(...args)

    return new Proxy(this, {
      get: (obj, prop, receiver, target = obj[prop]) =>
        (typeof target == 'function' && this.persist(prop))
        || target?.bind?.(obj) || target
    })
  }

  async isLoaded() {
    if (this.#persistLoaded) return true
    this.persisted = await this.ctx.storage.get('value')
    return this.#persistLoaded = true
  }

  persist(methodName) {
    if (!this.persisted) return

    clearTimeout(this.#persistTimer)
    this.#persistTimer = setTimeout(() => {
      this.ctx.storage.put('value', this.persisted)
    }, this.#persistDelay)
  }

  toJSON() {
    const { ctx, env, ...other } = this
    return other
  }
}

export class Counter extends IttyDurable {
  value = 0
  persisted: any = {
    counter: 0,
  }

  async increment() {
    await this.isLoaded()
    this.value++
    this.persisted.counter = (this.persisted.counter || 0) + 1

    return this.toJSON()
  }

  reset() {
    this.value = 0
    this.persisted = undefined

    return this.toJSON()
  }
}
