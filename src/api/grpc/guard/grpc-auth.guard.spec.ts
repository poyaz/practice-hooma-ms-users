import { GrpcAuthGuard } from './grpc-auth.guard';

describe('GrpcAuthGuard', () => {
  it('should be defined', () => {
    expect(new GrpcAuthGuard()).toBeDefined();
  });
});
