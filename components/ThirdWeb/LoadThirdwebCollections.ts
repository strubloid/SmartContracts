import { ThirdwebClient } from 'thirdweb';
import { loadThirdwebClient, getClientOrThrow } from './LoadThirdwebClient';
import { AppError } from '../../Interfaces/Error.Interface';

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
  // TODO: Implement actual ThirdWeb collections fetching
  // This is a placeholder implementation
  // In a real implementation, you would use the client to fetch collections
  // Example: const collections = await client.getCollections();
  
  // For now, return mock data structure
  const mockCollections: ThirdwebCollection[] = [
    {
      address: '0x1234567890123456789012345678901234567890',
      name: 'Sample NFT Collection',
      symbol: 'SNFT',
      description: 'A sample NFT collection for testing',
      image: 'https://example.com/image.png',
      totalSupply: '100',
    },
  ];
  
  return mockCollections;
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
