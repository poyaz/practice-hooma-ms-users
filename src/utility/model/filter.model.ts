import {NestedPaths, TypeFromNestedPath} from '@src-utility/utility';

export enum SortEnum {
  ASC = 'asc',
  DESC = 'desc',
}

export type SortDataType<T> = { path: NestedPaths<T>, mode: SortEnum };

export type FilterOperationType = 'eq' | 'neq' | 'gte' | 'gt' | 'lte' | 'lt';
export type FilterGroupOperationType = 'in';
export type FilterBetweenOperationType = 'btw';

export type FilterDataType<Path, Type> = { opr: FilterOperationType, path: Path, data: Type } |
  (
    Type extends string
      ? { opr: FilterGroupOperationType, path: Path, data: Array<Type> }
      : Type extends number | Date
        ? { opr: FilterGroupOperationType, path: Path, data: Array<Type> } |
        { opr: FilterBetweenOperationType, path: Path, data: { lower: Type, upper: Type } }
        : never
    );

export class FilterModel<T> {
  readonly page: number = 1;
  readonly limit: number = 100;
  readonly skipPagination: boolean = false;
  private _sort: Array<SortDataType<T>> = [];
  private readonly _conditions: Array<FilterDataType<string, TypeFromNestedPath<T, string>>> = [];

  constructor(props?: { page?: number, limit?: number, skipPagination?: boolean }) {
    if (props?.page && props?.page > 0) {
      this.page = props.page;
    }
    if (props?.limit && props?.limit > 0) {
      this.limit = props.limit;
    }
    if (props?.skipPagination) {
      this.skipPagination = props.skipPagination;
    }
  }

  addSortBy(path: NestedPaths<T>, mode: SortEnum): void {
    const find = this._sort.find((v) => v.path === path);
    if (find) {
      find.mode = mode;

      return;
    }

    this._sort.push({path, mode});
  }

  getSortBy(path: NestedPaths<T>): SortDataType<T> | null {
    const find = this._sort.find((v) => v.path === path);
    if (!find) {
      return null;
    }

    return find;
  }

  getSortByList(): Array<SortDataType<T>> {
    return this._sort;
  }

  getLengthOfSortBy(): number {
    return this._sort.length;
  }

  addCondition<P extends NestedPaths<T>>(condition: FilterDataType<P, TypeFromNestedPath<T, P>>): void {
    this._conditions.push(<FilterDataType<string, TypeFromNestedPath<T, string>>>condition);
  }

  getCondition<P extends NestedPaths<T>>(path: P): FilterDataType<P, TypeFromNestedPath<T, P>> | null {
    const find = this._conditions.filter((v) => v.path === path);
    if (!find || (find && find.length !== 1)) {
      return null;
    }

    return <FilterDataType<P, TypeFromNestedPath<T, P>>>find[0];
  }

  getConditionList<P extends NestedPaths<T>>(): Array<FilterDataType<P, TypeFromNestedPath<T, P>>> {
    return <Array<FilterDataType<P, TypeFromNestedPath<T, P>>>>this._conditions;
  }

  getLengthOfCondition(): number {
    return this._conditions.length;
  }
}
