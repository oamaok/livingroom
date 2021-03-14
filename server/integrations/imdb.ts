import fetch from 'node-fetch'
import { TitleSearchResult } from '../../common/protocol'
import { fromNullable } from '../../common/Option'

type ImdbImage = {
  height: number
  width: number
  imageUrl: string
}

type ImdbSuggestion = {
  id: string
  l: string // Title
  i?: ImdbImage // Poster
  q?: string // Title type (Movie, TV series, ...)
  rank: number // Rank
  s: string // Starring
  y: number // Year
  yr: string // Years
  vt: number // Unknown
  v: {
    // Videos
    i: ImdbImage
    id: string
    l: string
    s: string
  }[]
}

async function search(term: string): Promise<TitleSearchResult[]> {
  const formattedTerm = term
    .replace(/^\s|\s$/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase()

  const response = await fetch(
    `https://v2.sg.media-imdb.com/suggestion/${formattedTerm[0]}/${formattedTerm}.json`,
    {
      headers: {
        'Origin': 'https://www.imdb.com',
        'Referer': 'https://www.imdb.com',
        'Connection': 'keep-alive',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Accept': 'application/json, text/plain, */*',
      },
    }
  ).then((res) => res.json())

  const suggestions: ImdbSuggestion[] = response.d

  const results: TitleSearchResult[] = suggestions
    .filter(({ q }) => q)
    .map(({ id, i, l, q, yr }) => ({
      id,
      source: 'imdb',
      title: l,
      years: yr,
      type: q || '',
      poster: i?.imageUrl,
    }))

  return results
}

export { search }
