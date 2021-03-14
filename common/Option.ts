type OptionValue<T> = Readonly<Pick<[] | [T], 0 | 'length'>>

type OptionMethods<T> = Readonly<{
  map<A>(fn: (v: T) => A): Option<A>
  filter(fn: (v: T) => boolean): Option<T>
  chain<A>(fn: (v: T) => Option<A>): Option<A>
  exists(fn: (v: T) => boolean): boolean
  fold<A>(onNone: () => A, onSome: (v: T) => A): A
  alt(fn: () => Option<T>): Option<T>
  toNullable(): T | null
  value: OptionValue<T>
  isSome: boolean
}>

type Option<T = any> = Pick<OptionValue<T>, never> & OptionMethods<T>

class OptionImpl<T> extends Array<T> {
  exists: OptionMethods<T>['exists'] = super.some

  fold: OptionMethods<T>['fold'] = (onNone, onSome) => {
    if (this.length) return onSome(this[0])
    return onNone()
  }

  alt: OptionMethods<T>['alt'] = (fn) => {
    if (this.length) return (this as unknown) as Option<T>
    return fn()
  }

  chain: OptionMethods<T>['chain'] = (fn) => {
    if (this.length) return fn(this[0])
    return none
  }

  toNullable: OptionMethods<T>['toNullable'] = () => {
    if (this.length) return this[0]
    return null
  }

  value: OptionValue<T> = coerce<OptionValue<T>>(this)

  isSome: OptionMethods<T>['isSome'] = this.length === 1
}

function coerce<To>(value: any): To {
  return (value as unknown) as To
}

function some<T>(v: T): Option<T> {
  return coerce<Option<T>>(new OptionImpl(v))
}

const none = coerce<Option>(new OptionImpl())

type OptionAllArgs<A, B, C, D, E, F> =
  | [Option<A>, Option<B>]
  | [Option<A>, Option<B>, Option<C>]
  | [Option<A>, Option<B>, Option<C>, Option<D>]
  | [Option<A>, Option<B>, Option<C>, Option<D>, Option<E>]
  | [Option<A>, Option<B>, Option<C>, Option<D>, Option<E>, Option<F>]

type OptionAllRet<A, B, C, D, E, F> =
  | Option<[A, B]>
  | Option<[A, B, C]>
  | Option<[A, B, C, D]>
  | Option<[A, B, C, D, E]>
  | Option<[A, B, C, D, E, F]>

function all<A, B>(...args: [Option<A>, Option<B>]): Option<[A, B]>
function all<A, B, C>(
  ...args: [Option<A>, Option<B>, Option<C>]
): Option<[A, B, C]>
function all<A, B, C, D>(
  ...args: [Option<A>, Option<B>, Option<C>, Option<D>]
): Option<[A, B, C, D]>
function all<A, B, C, D, E>(
  ...args: [Option<A>, Option<B>, Option<C>, Option<D>, Option<E>]
): Option<[A, B, C, D, E]>
function all<A, B, C, D, E, F>(
  ...args: [Option<A>, Option<B>, Option<C>, Option<D>, Option<E>, Option<F>]
): Option<[A, B, C, D, E, F]>
function all<A, B, C = never, D = never, E = never, F = never>(
  ...args: OptionAllArgs<A, B, C, D, E, F>
): OptionAllRet<A, B, C, D, E, F> {
  switch (args.length) {
    case 2: {
      const [a, b] = args as [any, any]
      if (a.length && b.length)
        return coerce<Option<[A, B]>>(new OptionImpl([a[0], b[0]]))
      return none
    }
    case 3: {
      const [a, b, c] = args as [any, any, any]
      if (a.length && b.length && c.length)
        return coerce<Option<[A, B, C]>>(new OptionImpl([a[0], b[0], c[0]]))
      return none
    }
    case 4: {
      const [a, b, c, d] = args as [any, any, any, any]
      if (a.length && b.length && c.length && d.length) {
        return coerce<Option<[A, B, C, D]>>(
          new OptionImpl([a[0], b[0], c[0], d[0]])
        )
      }
      return none
    }
    case 5: {
      const [a, b, c, d, e] = args as [any, any, any, any, any]
      if (a.length && b.length && c.length && d.length && e.length) {
        return coerce<Option<[A, B, C, D, E]>>(
          new OptionImpl([a[0], b[0], c[0], d[0], e[0]])
        )
      }
      return none
    }
    case 6: {
      const [a, b, c, d, e, f] = args as [any, any, any, any, any, any]
      if (
        a.length &&
        b.length &&
        c.length &&
        d.length &&
        e.length &&
        f.length
      ) {
        return coerce<Option<[A, B, C, D, E, F]>>(
          new OptionImpl([a[0], b[0], c[0], d[0], e[0], f[0]])
        )
      }
      return none
    }
  }
}

function fromValue<T>(v: OptionValue<T>): Option<T> {
  return v.length ? some(v[0]) : none
}

function fromNullable<T>(v: T | undefined | null): Option<T> {
  return v === null || typeof v === 'undefined' ? none : some(v)
}

export { Option, OptionValue, fromValue, fromNullable, some, none, all }
