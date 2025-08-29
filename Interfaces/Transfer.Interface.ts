export interface TransferInput {
  to: string;
  amount: string;
  contractAddress: string;
  walletAddress: string;
}

export interface TransferResult {
  transactionId: string;
}
