import { spawn } from 'child_process'

const HEADER = `
import {
  createApi,
  CreateApiResponseType,
  CreateApiInterfaceType,
  CreateApiRequestType,
} from './server/createApi'
`

const FOOTER = `
type ApiInterface = CreateApiInterfaceType<typeof api>
type ApiResponse = CreateApiResponseType<typeof api>
type ApiRequest = CreateApiRequestType<typeof api>
`

const verbose =
  typeof process.env.VERBOSE_TESTS !== 'undefined'

const doesCompile = (code: string) =>
  new Promise((resolve) => {
    const tsc = spawn('npx', ['ts-node'])
    tsc.stdin.write(HEADER + code + FOOTER)
    tsc.stdin.end()
    if (verbose) {
      tsc.stderr.on('data', (data) => console.error(data.toString()))
      tsc.stdout.on('data', (data) => console.log(data.toString()))
    }
    tsc.on('exit', (code) => resolve(code === 0))
  })

const shouldNotCompile = async (code: string) => {
  if (await doesCompile(code)) {
    throw new Error('Code did compile when it should not')
  }
}

const shouldCompile = async (code: string) => {
  if (!(await doesCompile(code))) {
    throw new Error('Code did not compile when it should')
  }
}

describe('createApi', () => {
  it('should not compile with non-json-safe parameters', async () => {
    await shouldNotCompile(`
      const api = createApi({
        test(arg: Uint8Array): number { return 0 }
      })
    `)
    await shouldNotCompile(`
      const api = createApi({
        test(a: string, b: Document): number { return 0 }
      })
    `)
    await shouldNotCompile(`
      const api = createApi({
        test(arg: { foo: string, bar: { foobar: () => void }}): number { return 0 }
      })
    `)
  })

  it('should not compile with non-json-safe return value', async () => {
    await shouldNotCompile(`
      const api = createApi({
        test(arg: number): Uint8Array { return new Uint8Array() }
      })
    `)
  })

  it('should compile with deep objects as parameters', async () => {
    await shouldCompile(`
      const api = createApi({
        test(a: { b: { c: string }, d: { e: number }}): number { return 0 }
      })
    `)
  })

  it('should compile with deep objects as return value', async () => {
    await shouldCompile(`
      const api = createApi({
        test(a: number): { b: { c: string }, d: { e: number }} { return { b: { c: '' }, d: { e: 0 }} }
      })
    `)
  })

  it('should compile with array types as parameters', async () => {
    await shouldCompile(`
      const api = createApi({
        test(a: string[], b: number[], c: boolean[]): number { return 0 }
      })
    `)
  })

  // TODO: Add support for no params
  it.skip('should compile with no parameters', async () => {
    await shouldCompile(`
      const api = createApi({
        test(): number { return 0 }
      })
    `)
  })
})
