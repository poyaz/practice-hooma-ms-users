export type Return<E, D> = typeof E extends null | undefined
  ? [E]
  : D extends null | undefined
    ? [null | undefined, null | undefined]
    : D extends Array<any>
      ? [null | undefined, D, number]
      : [null | undefined, D];

export type AsyncReturn<E, D> = Promise<Return<E, D>>;

export type ModelRequireSubProp<T, CircleKey = never> = Omit<T, { [K in keyof T]: Omit<T, CircleKey>[K] extends Function ? K : K extends unique symbol ? K : never }[keyof T]>;

export type PickOne<T> = { [P in keyof T]: Record<P, T[P]> & Partial<Record<Exclude<keyof T, P>, undefined>> }[keyof T];

export type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K
} extends { [_ in keyof T]: infer U } ? U : never;

export type ClassConstructor<T> = {
  new(...args: any[]): T;
};

type JoinString<K, P> =
  K extends string | number ?
    P extends string | number ?
      `${K}${'' extends P ? '' : '.'}${P}`
      : never
    : never;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]

export type NestedPaths<T, D extends number = 3> = [D] extends [never]
  ? never
  : T extends object
    ? {
      [K in keyof T]-?: T[K] extends Function
        ? never
        : K extends string | number
          ? T[K] extends object
            ? T[K] extends Array
              ? `${K}` | JoinString<K, NestedPaths<T[K], Prev[D]>>
              : T[K] extends Date
                ? `${K}` | JoinString<K, NestedPaths<T[K], Prev[D]>>
                : JoinString<K, NestedPaths<T[K], Prev[D]>>
            : `${K}` | JoinString<K, NestedPaths<T[K], Prev[D]>>
          : never
    }[keyof T]
    : '';

type Primitive = string | number;

type GenericObject = Record<Primitive, unknown>;

/**
 * TypeFromPath
 * Get the type of the element specified by the path
 * @example
 * type TypeOfAB = TypeFromPath<{ a: { b: { c: string } }, 'a.b'>
 * // { c: string }
 */
export type TypeFromNestedPath<T,
  Path extends string, // Or, if you prefer, NestedPaths<T>
  > = {
  [K in Path]: K extends keyof T
    ? T[K]
    : K extends `${infer P}.${infer S}`
      ? T[P] extends GenericObject
        ? TypeFromNestedPath<T[P], S>
        : never
      : never;
}[Path];

type UniqueArray<T> =
  T extends readonly [infer X, ...infer Rest]
    ? InArray<Rest, X> extends true
    ? never
    : readonly [X, ...UniqueArray<Rest>]
    : T;

type InArray<T, X> =
  T extends readonly [X, ...infer _Rest]
    ? true
    : T extends readonly [X]
    ? true
    : T extends readonly [infer _, ...infer Rest]
      ? InArray<Rest, X>
      : false;
