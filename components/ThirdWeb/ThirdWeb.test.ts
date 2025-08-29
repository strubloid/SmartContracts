import { makeThirdWebService, ERC20_TRANSFER_ABI } from './ThirdWeb';
import { AppError } from '../../Interfaces/Error.Interface';

describe('ThirdWebService', () => {
  const mockPrepare = jest.fn();
  const mockEnqueue = jest.fn();
  const engine = {
    prepareContractCall: mockPrepare,
    serverWallet: { enqueueTransaction: mockEnqueue },
  } as any;
  const service = makeThirdWebService(engine);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use correct ABI string', () => {
    expect(ERC20_TRANSFER_ABI).toBe('function transfer(address to, uint256 amount)');
  });

  it('happy path: enqueues ERC-20 transfer', async () => {
    mockPrepare.mockResolvedValue('preparedTx');
    mockEnqueue.mockResolvedValue({ transactionId: 'mocked-tx-123' });
    const result = await service.enqueueErc20Transfer({
      to: '0xabc',
      amount: '100',
      contractAddress: '0xdef',
      walletAddress: '0xwallet',
    });
    expect(mockPrepare).toBeCalledWith({
      contractAddress: '0xdef',
      abi: ERC20_TRANSFER_ABI,
      functionName: 'transfer',
      args: ['0xabc', '100'],
    });
    expect(mockEnqueue).toBeCalledWith({ transaction: 'preparedTx', simulate: true });
    expect(result).toEqual({ transactionId: 'mocked-tx-123' });
  });

  it('error path: enqueueTransaction throws', async () => {
    mockPrepare.mockResolvedValue('preparedTx');
    mockEnqueue.mockRejectedValue(new Error('enqueue failed'));
    const result = await service.enqueueErc20Transfer({
      to: '0xabc',
      amount: '100',
      contractAddress: '0xdef',
      walletAddress: '0xwallet',
    });
    expect((result as AppError).code).toBe('THIRDWEB_ERROR');
    expect((result as AppError).message).toBe('enqueue failed');
  });

  it('error path: prepareContractCall throws', async () => {
    mockPrepare.mockRejectedValue(new Error('prepare failed'));
    const result = await service.enqueueErc20Transfer({
      to: '0xabc',
      amount: '100',
      contractAddress: '0xdef',
      walletAddress: '0xwallet',
    });
    expect((result as AppError).code).toBe('THIRDWEB_ERROR');
    expect((result as AppError).message).toBe('prepare failed');
  });
});

describe('env validation', () => {
  it('throws if required env missing', () => {
    const OLD_ENV = process.env;
    process.env = { ...OLD_ENV };
    delete process.env.WALLET_ADDRESS;
    delete process.env.CONTRACT_ADDRESS;
    jest.resetModules();
    expect(() => require('../../config/env')).toThrow('Missing required environment variables.');
    process.env = OLD_ENV;
  });
});
