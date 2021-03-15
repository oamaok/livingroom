import { v4 as uuid } from 'uuid'

import {
  ServerInterface,
  ServerMethods,
  ServerApi,
  ServerMessage,
  ApiRequest,
} from '../common/api'

const socket = new WebSocket('ws://localhost:8080', ['livingroom'])
const queries: Map<
  string,
  {
    request: ApiRequest
    resolve: (args: any) => void
  }
> = new Map()

let requestQueue: ApiRequest[] = []

socket.addEventListener('message', (msg) => {
  const data: ServerMessage = JSON.parse(msg.data)

  // TODO(teemu): Handle broadcasts
  if (data.type === 'QUERY') {
    const { id, payload } = data

    const query = queries.get(id)
    if (query) {
      const { resolve } = query
      resolve(payload.returnValue)
    }
  }
})

socket.addEventListener('open', () => {
  requestQueue.forEach(sendRequest)
  requestQueue = []
})

function sendRequest(request: ApiRequest) {
  socket.send(JSON.stringify(request))
}

function query<Method extends ServerMethods>(
  method: Method,
  parameters: Parameters<ServerApi[Method]>
): Promise<ReturnType<ServerApi[Method]>> {
  const request: ApiRequest = {
    type: 'QUERY',
    id: uuid(),
    time: Date.now(),
    payload: {
      method,
      parameters,
    },
  }

  if (socket.readyState === WebSocket.OPEN) {
    sendRequest(request)
  } else {
    requestQueue.push(request)
  }

  return new Promise<ReturnType<ServerApi[Method]>>((resolve) => {
    // TODO(teemu): Timeouts?
    queries.set(request.id, { request, resolve })
  })
}

const server = new Proxy<ServerInterface>({} as any, {
  get: <Method extends ServerMethods>(_: never, name: Method) => (
    ...parameters: Parameters<ServerApi[Method]>
  ) => query(name, parameters),
})

export { server }
