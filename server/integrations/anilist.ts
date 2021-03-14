import fetch from 'node-fetch'
import { TitleSearchResult } from '../../common/protocol'

// Docs: https://anilist.github.io/ApiV2-GraphQL-Docs/
type AnilistSuggestion = {
  id: number
  format: 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC'
  title: { userPreferred: string }
  coverImage: { large: string }
  startDate: { year: number }
  endDate?: { year: number }
  type: string
}

const formatToType: { [key in AnilistSuggestion['format']]: string } = {
  TV: 'TV Series',
  TV_SHORT: 'TV Series',
  MOVIE: 'Movie',
  SPECIAL: 'Special',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Music',
}

async function search(term: string) {
  const query = {
    query: `
      query(
        $page:Int = 1
        $id:Int 
        $type:MediaType 
        $isAdult:Boolean = false 
        $search:String
        $status:MediaStatus 
        $countryOfOrigin:CountryCode 
        $source:MediaSource 
        $season:MediaSeason 
        $seasonYear:Int 
        $year:String 
        $onList:Boolean 
        $yearLesser:FuzzyDateInt 
        $yearGreater:FuzzyDateInt 
        $episodeLesser:Int 
        $episodeGreater:Int 
        $durationLesser:Int 
        $durationGreater:Int 
        $chapterLesser:Int 
        $chapterGreater:Int 
        $volumeLesser:Int 
        $volumeGreater:Int 
        $licensedBy:[String]
        $genres:[String]
        $excludedGenres:[String]
        $tags:[String]
        $excludedTags:[String]
        $minimumTagRank:Int 
        $sort:[MediaSort]=[SCORE_DESC]
      ) {
        Page(page:$page, perPage:5) {
          pageInfo { total perPage currentPage lastPage hasNextPage }
          media(
            id:$id
            type:$type
            season:$season
            status:$status
            countryOfOrigin:$countryOfOrigin
            source:$source
            search:$search
            onList:$onList
            seasonYear:$seasonYear
            startDate_like:$year
            startDate_lesser:$yearLesser
            startDate_greater:$yearGreater
            episodes_lesser:$episodeLesser
            episodes_greater:$episodeGreater
            duration_lesser:$durationLesser
            duration_greater:$durationGreater
            chapters_lesser:$chapterLesser
            chapters_greater:$chapterGreater
            volumes_lesser:$volumeLesser
            volumes_greater:$volumeGreater
            licensedBy_in:$licensedBy
            genre_in:$genres
            genre_not_in:$excludedGenres
            tag_in:$tags
            tag_not_in:$excludedTags
            minimumTagRank:$minimumTagRank
            sort:$sort
            isAdult:$isAdult
          ) {
            id
            format
            averageScore
            title { userPreferred }
            coverImage { large }
            startDate { year }
            endDate { year }
            type
          }
        }
      }`,
    variables: { page: 1, type: 'ANIME', search: term },
  }

  const response = await fetch('https://graphql.anilist.co/', {
    method: 'POST',
    body: JSON.stringify(query),
    headers: {
      'content-type': 'application/json',
      'Origin': 'https://anilist.co',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
    },
  }).then((res) => res.json())

  const suggestions: AnilistSuggestion[] = response.data.Page.media

  const results: TitleSearchResult[] = suggestions.map(
    ({ id, title, coverImage, startDate, endDate, format }) => ({
      id: String(id),
      source: 'anilist',
      title: title.userPreferred,
      poster: coverImage.large,
      years: `${startDate.year}-${endDate?.year ?? ''}`,
      type: formatToType[format],
    })
  )

  return results
}

export { search }
