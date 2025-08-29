import { ThirdwebSDK, Engine } from '@thirdweb-dev/sdk';
import { AppError } from '../../Interfaces/Error.Interface';
import { TransferInput, TransferResult } from '../../Interfaces/Transfer.Interface';
import { ThirdWebService } from '../../Interfaces/ThirdWeb.Interface';
import { env } from '../../config/env';

// Pure function for ABI
export const ERC20_TRANSFER_ABI = 'function transfer(address to, uint256 amount)';

// Dependency injection for Engine
export function makeThirdWebService(engine: Engine): ThirdWebService {
  return {
    enqueueErc20Transfer: async (input: TransferInput): Promise<TransferResult | AppError> => {
      try {
        const prepared = await engine.prepareContractCall({
          contractAddress: input.contractAddress,
          abi: ERC20_TRANSFER_ABI,
          functionName: 'transfer',
          args: [input.to, input.amount],
        });
        const result = await engine.serverWallet.enqueueTransaction({
          transaction: prepared,
          simulate: true,
        });
        return { transactionId: result.transactionId };
      } catch (err: any) {
        return { code: 'THIRDWEB_ERROR', message: err.message, cause: err };
      }
    },
  };
}
