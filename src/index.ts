import { AutoRouter } from 'itty-router'
export { Counter } from './objects/Counter'

const withDurables = (request, env) => {
  request.proxy = new Proxy(request.proxy ?? request, {
    get: (target: Request, prop: string, receiver) => {
      if (target[prop] != undefined)
        return target[prop]

      const DO = env[prop], isDO = DO?.idFromName
      if (!isDO) return undefined

      return (id) =>
        typeof id == 'string'
        ? DO.get(DO.idFromName(id))
        : DO.get(id)
      }
    }
  )
}

const router = AutoRouter({
  before: [withDurables],
})

router
  .get('/increment', ({ Counter }) =>
    Counter('foo').increment()
  )
  .get('/reset', ({ Counter }) =>
    Counter('foo').reset()
  )

export default { ...router }
