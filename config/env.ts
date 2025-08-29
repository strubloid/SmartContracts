import * as dotenv from 'dotenv';
import { Env } from '../Interfaces/Env.Interface';

const result = dotenv.config();

function parseEnv(): Env {
  const {
    PORT,
    CHAIN,
    CLIENT_ID,
    CLIENT_SECRET,
    WALLET_ADDRESS,
    CONTRACT_ADDRESS,
  } = process.env;

  if (!PORT || !CHAIN || !CLIENT_ID || !CLIENT_SECRET || !WALLET_ADDRESS || !CONTRACT_ADDRESS) {
    throw new Error('Missing required environment variables.');
  }

  return {
    PORT: Number(PORT),
    CHAIN,
    CLIENT_ID,
    CLIENT_SECRET,
    WALLET_ADDRESS,
    CONTRACT_ADDRESS,
  };
}

export const env = parseEnv();
