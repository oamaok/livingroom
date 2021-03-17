import React, { useState, useCallback } from 'react'
import { bind } from 'classnames/bind'
import { server } from './connection'
import styles from './App.scss'
import { TitleSearchResult } from '../common/types'

const css = bind(styles)

const debounce = <F extends (...args: any) => void>(fn: F) => {
  let timeout: ReturnType<typeof setTimeout>
  let args: Parameters<F>
  const call = () => fn(...args)
  return (...a: Parameters<F>) => {
    args = a
    clearTimeout(timeout)
    timeout = setTimeout(call, 1000)
  }
}

type SearchResponse = {
  loading: boolean
  results: TitleSearchResult[]
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [response, setResponse] = useState<SearchResponse>({
    loading: true,
    results: [],
  })

  const search = useCallback(
    debounce(async (term: string) => {
      setResponse({
        loading: false,
        results: await server.searchMedia(term),
      })
    }),
    []
  )

  const onTermChange = (term: string) => {
    setResponse({
      loading: true,
      results: [],
    })
    setSearchTerm(term)
    search(term)
  }

  return (
    <div className={css('app')}>
      <input
        value={searchTerm}
        onChange={(evt) => onTermChange(evt.target.value)}
      />
      <div className={css('results')}>
        {response.results.map((result) => (
          <div className={css('result')}>
            {result.poster && <img src={result.poster} />}

            {result.title}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
