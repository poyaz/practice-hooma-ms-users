import {DefaultPropertiesSymbol, IsDefaultSymbol} from './symbol';
import {NestedPaths} from '@src-utility/utility';
import {BaseModel} from './baseModel';
import cloneDeep = require('lodash.clonedeep');

export type DefaultModelType<T> = Omit<T, 'clone'> & DefaultModelInterface<T>;

export interface DefaultModelInterface<T> {
  readonly [IsDefaultSymbol]: boolean;
  readonly [DefaultPropertiesSymbol]: Array<NestedPaths<T>>;

  isDefaultProperty(property: NestedPaths<T>): boolean;

  clone(): T;
}

export function defaultModelFactory<T extends BaseModel<T>>(data: T): DefaultModelType<T> {
  const nestedProxy = function (prefixPath: string, defaultProperties: Array<any>): ProxyHandler<any> {
    return {
      get(obj, prop, receiver) {
        if (typeof obj[prop] === 'function') {
          if (prop === 'clone') {
            return () => {
              const newData = cloneDeep(obj);

              return new Proxy(newData, nestedProxy('', newData[DefaultPropertiesSymbol]));
            };
          }

          return Reflect.get(obj, prop, receiver);
        }

        if (typeof prop === 'symbol' || obj[prop] instanceof Date || Array.isArray(obj[prop])) {
          return Reflect.get(obj, prop, receiver);
        }

        if (obj[prop] instanceof Object && typeof obj[prop] !== 'function') {
          const nextPrefixPath = `${prefixPath}${prop.toString()}.`;

          return new Proxy(obj[prop], nestedProxy(nextPrefixPath, obj[DefaultPropertiesSymbol]));
        }

        return Reflect.get(obj, prop, receiver);
      },
      set(obj, prop, value) {
        const keyRegex = typeof value === 'object' && !(value instanceof Date)
          ? new RegExp(`^${prefixPath.replace('.', '\\.')}${prop.toString()}\\..+`)
          : new RegExp(`^${prefixPath.replace('.', '\\.')}${prop.toString()}$`);

        const keyList = defaultProperties.filter((v) => v.match(keyRegex));

        for (const key of keyList) {
          const index = defaultProperties.indexOf(key);
          if (index > -1) {
            defaultProperties.splice(index, 1);
          }
        }

        obj[prop] = value;

        return true;
      },
    };
  };

  const proxyInstance = new Proxy(data, nestedProxy('', data[DefaultPropertiesSymbol]));

  proxyInstance.isDefaultProperty = (property: NestedPaths<T>) =>
    proxyInstance[DefaultPropertiesSymbol].indexOf(property) > -1;

  return proxyInstance;
}
