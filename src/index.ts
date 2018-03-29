export type ArrayValue<T> = T extends Array<infer R> ? R : never

export interface LensApply<T, P> {
  (): Getter<T, P>
  (value: P): Setter<T>
}

export type LensObject<T, P> = { [K in keyof P]-?: Lens<T, P[K]> }

export interface LensArray<T, P> extends Array<Lens<T, ArrayValue<P>>> {}

export type Lens<T, P> = LensApply<T, P> & LensObject<T, P> & LensArray<T, P>

export type Getter<T, R> = (target: T) => R
export type Setter<T> = (target: T) => T

function noop(): void {}

function copy<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.slice() as any
  } else if (value && typeof value === 'object') {
    return Object.keys(value).reduce<any>((res, k) => {
      res[k] = (value as any)[k]
      return res
    }, {})
  } else {
    return value
  }
}

function keyLens<T, P, K extends keyof P>(
  _get: Getter<T, P>,
  _set: (value: P) => Setter<T>,
  key: K
): Lens<T, P[K]> {
  return _lens(
    target => _get(target)[key],
    value => target => {
      const parent = copy(_get(target))
      parent[key] = value
      return _set(parent)(target)
    }
  )
}

function _lens<T, P>(
  _get: Getter<T, P>,
  _set: (value: P) => Setter<T>
): Lens<T, P> {
  const p: any = new Proxy(
    noop,
    {
      get(_, name) {
        return keyLens(_get, _set, name as any)
      },

      apply(_target, _that, args) {
        const value = args[0]

        if (value) {
          return _set(value)
        } else {
          return _get
        }
      }
    }
  )
  return p
}

export function lens<T>(): Lens<T, T> {
  return _lens(t => t, t => _ => t)
}
