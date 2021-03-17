type TitleSearchResult = {
  id: string
  source: 'imdb' | 'anilist'
  title: string
  years: string
  type: string
  poster?: string
}

export { TitleSearchResult }
