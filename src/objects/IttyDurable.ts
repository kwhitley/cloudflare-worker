import { DurableObject } from 'cloudflare:workers'

const PERSIST_DELAY = 5000

type Store = {
  get: () => any,
  put: (value: any) => any,
}

export class IttyDurable extends DurableObject {
  // private attributes
  #persistTimer: any
  #persistLoaded: undefined | true

  // public attributes
  persisted: any

  // default store
  store: Store = {
    // @ts-ignore
    get: () => this.ctx.storage.get('i'),
    // @ts-ignore
    put: (value: any) => this.ctx.storage.put('i', value)
  }

  constructor(...args: any) {
    // @ts-ignore
    super(...args)

    return new Proxy(this, {
      get: (
        obj,
        prop,
        receiver,
        // @ts-ignore
        target = obj[prop],
        fn = target?.bind?.(obj),
      ) => {
        if (!fn) return target
        this.persist()
        return async (...args: any) => this.#sync().then(() => fn(args))
      }
    })
  }

  // PRIVATE: internal storage sync
  async #sync() {
    if (this.#persistLoaded) return
    this.persisted = await this.store.get.call(this)
    this.#persistLoaded = true
  }

  // PUBLIC: persist() to manually persist
  persist(delay?: number) {
    if (!this.persisted) return // skip if nothing to persist

    // remove previous timer
    clearTimeout(this.#persistTimer)

    // add a new delayed/debounced timer for persistence
    this.#persistTimer = setTimeout(() => {
      this.store.put.call(this, this.persisted)
    }, delay ?? PERSIST_DELAY)
  }

  // PUBLIC: toJSON() strips the CF specific objects to display the rest
  toJSON() {
    // @ts-ignore
    const { ctx, env, store, ...other } = this
    return other
  }
}
