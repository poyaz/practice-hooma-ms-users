export interface ServerConfigInterface {
  readonly host: string;
  readonly grpc: {
    readonly port: number;
  };
}
