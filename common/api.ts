import { OptionValue } from './Option'

type TitleSearchResult = {
  id: string
  source: 'imdb' | 'anilist'
  title: string
  years: string
  type: string
  poster?: string
}

type SafeValue = null | number | string | boolean
type SafeObject =
  | SafeObject[]
  | SafeValue
  | {
      [key: string]:
        | OptionValue<SafeObject>
        | Readonly<SafeObject | SafeObject[]>
    }

type EnsureJsonSafety<
  T extends {
    [key: string]: (...args: any[]) => SafeObject
  }
> = T

type Torrent = {
  name: string
}

type ServerApi = EnsureJsonSafety<{
  searchByTitle(title: string): TitleSearchResult[]
  listTorrents(): Torrent[]
}>

type ServerMethods = keyof ServerApi

type ApiRequest<Method extends ServerMethods = ServerMethods> = {
  type: 'QUERY'
  id: string
  time: number
  payload: {
    method: Method
    parameters: Parameters<ServerApi[Method]>
  }
}

type ApiResponse<Method extends ServerMethods = ServerMethods> = {
  type: 'QUERY'
  id: string
  time: number
  payload: {
    method: Method
    returnValue: ReturnType<ServerApi[Method]>
  }
}

type ServerInterface = {
  [Method in ServerMethods]: (
    ...args: Parameters<ServerApi[Method]>
  ) => Promise<ReturnType<ServerApi[Method]>>
}

type Broadcast = {
  type: 'BROADCAST'
  time: number
  payload: {}
}

type ServerMessage = ApiResponse | Broadcast

export {
  TitleSearchResult,
  ServerApi,
  ServerMethods,
  ServerMessage,
  ServerInterface,
  ApiRequest,
  ApiResponse,
}
