import { v4 as uuid } from 'uuid'
import {
  Query,
  QueryTypes,
  QueryParameters,
  QueryReturnValue,
  QueryRequest,
  ServerMessage,
} from '../common/protocol'

const socket = new WebSocket('ws://localhost:8080', ['livingroom'])
const queries: Map<
  string,
  {
    request: QueryRequest
    resolve: (args: any) => void
  }
> = new Map()

let requestQueue: QueryRequest[] = []

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

function sendRequest(request: QueryRequest) {
  socket.send(JSON.stringify(request))
}

function query<Type extends QueryTypes>(
  type: Type,
  parameters: QueryParameters<Type>
): Promise<QueryReturnValue<Type>> {
  const request: QueryRequest = {
    type: 'QUERY',
    id: uuid(),
    time: Date.now(),
    payload: {
      type,
      parameters,
    },
  }

  if (socket.readyState === WebSocket.OPEN) {
    sendRequest(request)
  } else {
    requestQueue.push(request)
  }

  return new Promise<QueryReturnValue<Type>>((resolve) => {
    // TODO(teemu): Timeouts?
    queries.set(request.id, { request, resolve })
  })
}

export { query }
