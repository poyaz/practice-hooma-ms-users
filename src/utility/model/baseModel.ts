import {DefaultPropertiesSymbol, IsDefaultSymbol} from './symbol';
import {ModelRequireSubProp, NestedPaths} from '@src-utility/utility';

export type ModelRequireProp<T, CircleKey = never> =
  ModelRequireSubProp<T, CircleKey>
  & { [IsDefaultSymbol]?: boolean, [DefaultPropertiesSymbol]?: Array<NestedPaths<T>> };

export abstract class BaseModel<T> {
  [IsDefaultSymbol]: boolean = false;
  [DefaultPropertiesSymbol]: Array<string> = [];

  clone(): T {
    return Object.assign(Object.create(this), this);
  }
}
