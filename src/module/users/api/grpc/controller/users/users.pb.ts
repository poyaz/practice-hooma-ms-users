/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "users";

export interface FindAllRequest {
  name: string;
  username: string;
  role: string;
}

export interface FindAllResponse {
  count: number;
  data: FindOneResponse[];
}

export interface FindOneRequest {
  userId: string;
}

export interface FindOneResponse {
  id: string;
  username: string;
  role: string;
  name: string;
  age: number;
  createAt: string;
  updateAt: string;
}

export interface CreateRequest {
  username: string;
  password: string;
  role: string;
  name: string;
  age: number;
}

export interface UpdateRequest {
  userId: string;
  password?: string | undefined;
  role?: string | undefined;
  name?: string | undefined;
  age?: number | undefined;
}

export interface DeleteRequest {
  userId: string;
}

export interface UpdateAndDeleteResponse {
  count: string;
}

export const USERS_PACKAGE_NAME = "users";

export interface UsersServiceClient {
  findAll(request: FindAllRequest): Observable<FindAllResponse>;

  findOne(request: FindOneRequest): Observable<FindOneResponse>;

  create(request: CreateRequest): Observable<FindOneResponse>;

  update(request: UpdateRequest): Observable<UpdateAndDeleteResponse>;

  delete(request: DeleteRequest): Observable<UpdateAndDeleteResponse>;
}

export interface UsersServiceController {
  findAll(request: FindAllRequest): Promise<FindAllResponse> | Observable<FindAllResponse> | FindAllResponse;

  findOne(request: FindOneRequest): Promise<FindOneResponse> | Observable<FindOneResponse> | FindOneResponse;

  create(request: CreateRequest): Promise<FindOneResponse> | Observable<FindOneResponse> | FindOneResponse;

  update(
    request: UpdateRequest,
  ): Promise<UpdateAndDeleteResponse> | Observable<UpdateAndDeleteResponse> | UpdateAndDeleteResponse;

  delete(
    request: DeleteRequest,
  ): Promise<UpdateAndDeleteResponse> | Observable<UpdateAndDeleteResponse> | UpdateAndDeleteResponse;
}

export function UsersServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["findAll", "findOne", "create", "update", "delete"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("UsersService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("UsersService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const USERS_SERVICE_NAME = "UsersService";
