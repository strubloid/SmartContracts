import { getContract, ThirdwebClient, readContract } from 'thirdweb';
import { loadThirdwebClient, getClientOrThrow } from './LoadThirdwebClient';
import { AppError } from '../../Interfaces/Error.Interface';
import { avalancheFuji } from "thirdweb/chains";
import { env } from '../../config/env';

/**
 * Collection data structure
 */
export interface ThirdwebCollection {
  address: string;
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  totalSupply?: string;
}

/**
 * Result type for ThirdWeb collections loading operation
 */
export type LoadThirdwebCollectionsResult = 
  | { success: true; collections: ThirdwebCollection[] }
  | { success: false; error: AppError };

/**
 * Pure function to create error response
 * @param message - Error message
 * @param code - Error code
 * @returns AppError object
 */
const createError = (message: string, code: string): AppError => ({
  message,
  code,
});

/**
 * Higher-order function to wrap collections loading with error handling
 * @param collectionsLoader - Function to load collections
 * @returns Function that safely loads collections with error handling
 */
const withErrorHandling = (
  collectionsLoader: (client: ThirdwebClient) => Promise<ThirdwebCollection[]>
) => async (client: ThirdwebClient): Promise<LoadThirdwebCollectionsResult> => {
  try {
    const collections = await collectionsLoader(client);
    return { success: true, collections };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { 
      success: false, 
      error: createError(
        `Failed to load ThirdWeb collections: ${errorMessage}`,
        'THIRDWEB_COLLECTIONS_LOAD_ERROR'
      )
    };
  }
};

/**
 * Pure function to fetch collections from ThirdWeb
 * @param client - ThirdWeb client instance
 * @returns Promise resolving to array of collections
 */
const fetchCollections = async (client: ThirdwebClient): Promise<ThirdwebCollection[]> => {
  try {
    // Define the standard ERC-721 ABI for the functions we need
    const erc721ABI = [
      {
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol", 
        "outputs": [{"name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view", 
        "type": "function"
      }
    ] as const;

    // Get contract with ABI
    const contract = getContract({
      client,
      chain: avalancheFuji,
      address: env.CONTRACT_ADDRESS,
      abi: erc721ABI, // Provide the ABI
    });

    console.log('Loaded contract:', contract);
    
    // Now read data from this contract using the simple method names (since we have ABI)
    const [name, symbol] = await Promise.all([
      readContract({
        contract,
        method: "name", // Simple method name works with ABI
        params: []
      }),
      readContract({
        contract,
        method: "symbol", // Simple method name works with ABI
        params: []
      })
    ]);

    // Try to get totalSupply (might not exist on all contracts)
    let totalSupply = "0";
    try {
      const supply = await readContract({
        contract,
        method: "totalSupply", // Simple method name works with ABI
        params: []
      });
      totalSupply = supply.toString();
    } catch {
      // totalSupply not available - that's okay
    }

    console.log('Collection details:');
    console.log(`- Name: ${name}`);
    console.log(`- Symbol: ${symbol}`);
    console.log(`- Total Supply: ${totalSupply}`);

    const collection: ThirdwebCollection[] = [{
      address: env.CONTRACT_ADDRESS,
      name: String(name),
      symbol: String(symbol),
      totalSupply,
      description: `NFT Collection on Avalanche Fuji`,
    }];

    return collection;
  } catch (error) {
    console.error('Error reading contract:', error);
    
    // Return fallback data if contract reading fails
    return [{
      address: env.CONTRACT_ADDRESS,
      name: 'Unknown Collection',
      symbol: 'UNKNOWN',
      totalSupply: '0',
      description: 'Contract could not be read (possibly not verified or not ERC-721)',
    }];
  }
};

/**
 * Loads ThirdWeb collections using functional programming principles
 * @param client - Optional ThirdWeb client (if not provided, will load one)
 * @returns Promise resolving to LoadThirdwebCollectionsResult
 */
export const loadThirdwebCollections = async (
  client?: ThirdwebClient
): Promise<LoadThirdwebCollectionsResult> => {
  try {
    let thirdwebClient: ThirdwebClient;

    if (client) {
      // Use provided client
      thirdwebClient = client;
    } else {
      // Load client if not provided
      const clientResult = await loadThirdwebClient();
      if (!clientResult.success) {
        return {
          success: false,
          error: createError(
            `Failed to load ThirdWeb client: ${clientResult.error.message}`,
            'CLIENT_LOAD_ERROR'
          ),
        };
      }
      thirdwebClient = clientResult.client;
    }

    // Load collections with error handling
    const safeLoadCollections = withErrorHandling(fetchCollections);
    const result = await safeLoadCollections(thirdwebClient);
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: createError(
        `Unexpected error during collections loading: ${errorMessage}`,
        'COLLECTIONS_INITIALIZATION_ERROR'
      )
    };
  }
};

/**
 * Utility function to extract collections from result (for convenience)
 * @param result - LoadThirdwebCollectionsResult
 * @returns Collections array if successful, throws error if failed
 */
export const getCollectionsOrThrow = (result: LoadThirdwebCollectionsResult): ThirdwebCollection[] => {
  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.collections;
};
