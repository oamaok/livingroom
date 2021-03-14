import { OptionValue } from './Option'

type TitleSearchResult = {
  id: string
  source: 'imdb' | 'anilist'
  title: string
  years: string
  type: string
  poster?: string
}

type File = { name: string }

type Query =
  | QueryType<'SEARCH TITLE', { title: string }, TitleSearchResult[]>
  | QueryType<'LIST TORRENTS', {}, { results: string[] }>
  | QueryType<'ADD TORRENT', { hash: string }, { id: string }>
  | QueryType<'GET TORRENT', { id: string }, { id: string; files: File[] }>
  | QueryType<'REMOVE TORRENT', { id: string }, { ok: boolean }>

type ExtractByType<A, T> = A extends { type: T } ? A : never

type SafeValue = null | number | string | boolean
type SafeObject =
  | SafeObject[]
  | SafeValue
  | {
      [key: string]:
        | OptionValue<SafeObject>
        | Readonly<SafeValue>
        | Readonly<SafeObject>
        | Readonly<SafeValue[]>
        | Readonly<SafeObject[]>
    }

type QueryType<
  Type,
  Parameters extends SafeObject,
  ReturnValue extends SafeObject
> = {
  type: Type
  parameters: Parameters
  returnValue: ReturnValue
}

type QueryTypes = Query['type']
type QueryParameters<Type> = ExtractByType<Query, Type>['parameters']
type QueryReturnValue<Type> = ExtractByType<Query, Type>['returnValue']

type QueryRequest = {
  type: 'QUERY'
  id: string
  time: number
  payload: Omit<Query, 'returnValue'>
}

type QueryResponse = {
  type: 'QUERY'
  id: string
  time: number
  payload: Omit<Query, 'parameters'>
}

type Broadcast = {
  type: 'BROADCAST'
  time: number
  payload: {}
}

type ServerMessage = QueryResponse | Broadcast

export {
  TitleSearchResult,
  ExtractByType,
  Broadcast,
  Query,
  QueryTypes,
  QueryParameters,
  QueryReturnValue,
  QueryRequest,
  QueryResponse,
  ServerMessage,
}
