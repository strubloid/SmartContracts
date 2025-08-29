import { TransferInput, TransferResult } from './Transfer.Interface';
import { AppError } from './Error.Interface';

export interface ThirdWebService {
  enqueueErc20Transfer: (
    input: TransferInput
  ) => Promise<TransferResult | AppError>;
}
