import { AppError } from './Error.Interface';

export interface Ports {
  enqueueTransfer: (input: {
    to: string;
    amount: string;
    contractAddress: string;
    walletAddress: string;
  }) => Promise<{ transactionId: string } | AppError>;
}
