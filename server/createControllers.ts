import { connection } from 'websocket'
import {
  QueryTypes,
  QueryParameters,
  QueryReturnValue,
  QueryRequest,
  QueryResponse,
} from '../common/protocol'

type ControllerDefinition<Type extends QueryTypes> = (
  params: QueryParameters<Type>
) => QueryReturnValue<Type> | Promise<QueryReturnValue<Type>>

type ControllerDefinitions = {
  [Key in QueryTypes]: (
    params: QueryParameters<Key>
  ) => QueryReturnValue<Key> | Promise<QueryReturnValue<Key>>
}

export function createControllers(struct: ControllerDefinitions) {
  return (connection: connection) => {
    connection.on('message', async (message) => {
      if (!message.utf8Data) return

      const { id, payload }: QueryRequest = JSON.parse(message.utf8Data)

      const controller = struct[payload.type] as any
      const returnValue = await controller(payload.parameters)

      const response: QueryResponse = {
        id,
        time: Date.now(),
        type: 'QUERY',
        payload: {
          type: payload.type,
          returnValue,
        },
      }
      connection.send(JSON.stringify(response))
    })
  }
}
