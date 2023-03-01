export interface JwtConfigInterface {
  readonly algorithm: string;
  readonly publicKey: string;
  readonly expiresTime: string;
}
