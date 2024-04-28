import { AutoRouter } from 'itty-router'

const router = AutoRouter()

router.get('/', () => 'Hello World!')

export default { ...router }
