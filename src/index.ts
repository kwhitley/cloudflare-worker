import { AutoRouter } from 'itty-router'
export { Counter } from './objects/Counter'

export const withDO = (request: any, env: any) => {
  for (const [k, v] of Object.entries(env)) {
    // @ts-ignore
    if (v?.idFromName)
      // @ts-ignore
      request[k] = request[k] ?? ((id: any) => typeof id == 'string' ? v.get(v.idFromName(id)) : v.get(id))
  }
}

const router = AutoRouter({
  before: [withDO],
})

router
  .get('/increment/:by', ({ Counter, by }) =>
    Counter('foo').increment(by)
  )
  .get('/reset', ({ Counter }) =>
    Counter('foo').reset()
  )

export default { ...router }
