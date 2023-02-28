export interface JwtConfigInterface {
  readonly algorithm: string;
  readonly publicKey: string;
  readonly privateKey: string;
  readonly expiresTime: string;
}
