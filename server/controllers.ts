import { createControllers } from './createControllers'
import * as imdb from './integrations/imdb'
import * as anilist from './integrations/anilist'

export default createControllers({
  async searchByTitle(title) {
    const [imdbResults, anilistResults] = await Promise.all([
      imdb.search(title),
      anilist.search(title),
    ])

    return [...anilistResults, ...imdbResults]
  },

  async listTorrents() {
    return []
  },
})
