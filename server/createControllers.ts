import { connection } from 'websocket'

import { ServerInterface, ApiRequest, ApiResponse } from '../common/api'

export function createControllers(struct: ServerInterface) {
  return (connection: connection) => {
    connection.on('message', async (message) => {
      if (!message.utf8Data) return

      const { id, payload }: ApiRequest = JSON.parse(message.utf8Data)

      const controller = struct[payload.method] as any
      const returnValue = await controller(...payload.parameters)

      const response: ApiResponse = {
        id,
        time: Date.now(),
        type: 'QUERY',
        payload: {
          method: payload.method,
          returnValue,
        },
      }
      connection.send(JSON.stringify(response))
    })
  }
}
