import { createControllers } from './createControllers'
import * as imdb from './integrations/imdb'
import * as anilist from './integrations/anilist'

export default createControllers({
  'SEARCH TITLE': async ({ title }) => {
    const [imdbResults, anilistResults] = await Promise.all([
      anilist.search(title),
      imdb.search(title),
    ])

    return [...imdbResults, ...anilistResults]
  },
  'ADD TORRENT': async ({ hash }) => {
    return { id: '' }
  },
  'GET TORRENT': async ({ id }) => {
    return { id: '', files: [] }
  },
  'LIST TORRENTS': async () => {
    return { results: [] }
  },
  'REMOVE TORRENT': async () => {
    return { ok: true }
  },
})
