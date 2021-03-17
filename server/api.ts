import {
  createApi,
  CreateApiInterfaceType,
  CreateApiResponseType,
  CreateApiRequestType,
} from './createApi'
import * as imdb from './integrations/imdb'
import * as anilist from './integrations/anilist'

const api = createApi({
  async searchMedia(title: string) {
    const [imdbResults, anilistResults] = await Promise.all([
      imdb.search(title),
      anilist.search(title),
    ])

    return [...anilistResults, ...imdbResults]
  },
})

type ApiInterface = CreateApiInterfaceType<typeof api>
type ApiResponse = CreateApiResponseType<typeof api>
type ApiRequest = CreateApiRequestType<typeof api>

export { api, ApiInterface, ApiResponse, ApiRequest }
