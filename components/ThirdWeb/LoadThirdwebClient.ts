import { createThirdwebClient, ThirdwebClient } from 'thirdweb';
import { env } from '../../config/env';
import { AppError } from '../../Interfaces/Error.Interface';

/**
 * Result type for ThirdWeb client loading operation
 */
export type LoadThirdwebClientResult = 
  | { success: true; client: ThirdwebClient }
  | { success: false; error: AppError };

/**
 * Pure function to create ThirdWeb client configuration
 * @returns Client configuration object
 */
const createClientConfig = () => ({
  clientId: env.CLIENT_ID,
  secretKey: env.CLIENT_SECRET,
});

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
 * Higher-order function to wrap ThirdWeb client creation with error handling
 * @param clientFactory - Function to create ThirdWeb client
 * @returns Function that safely creates client with error handling
 */
const withErrorHandling = (
  clientFactory: (config: ReturnType<typeof createClientConfig>) => ThirdwebClient
) => (config: ReturnType<typeof createClientConfig>): LoadThirdwebClientResult => {
  try {
    const client = clientFactory(config);
    return { success: true, client };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { 
      success: false, 
      error: createError(
        `Failed to create ThirdWeb client: ${errorMessage}`,
        'THIRDWEB_CLIENT_CREATION_ERROR'
      )
    };
  }
};

/**
 * Pure function to create ThirdWeb client
 * Uses the same pattern as in index.ts
 * @param config - Client configuration
 * @returns ThirdWeb client instance
 */
const createClient = (config: ReturnType<typeof createClientConfig>): ThirdwebClient => {
  // Using the exact same pattern as in index.ts
  const client = createThirdwebClient({
    clientId: config.clientId,
    secretKey: config.secretKey,
  } as any); // Type assertion to work around TypeScript definition issue
  
  return client;
};


/**
 * Client Id vs Secret Key:
 * ==> Client Id is used for client side usage and is restricted by the domain restrictions you set on your API key, it is a public identifier which can be used on the frontend safely.
 * ==> Secret key is used for server side or script usage and is not restricted by the domain restrictions. Never expose your secret key in client side code.
 * 
 * Loads and initializes a ThirdWeb client using functional programming principles
 * @returns Promise resolving to LoadThirdwebClientResult
 */
export const loadThirdwebClient = async (): Promise<LoadThirdwebClientResult> => {
  try {
    // Validate environment variables
    if (!env.CLIENT_ID || !env.CLIENT_SECRET) {
      return {
        success: false,
        error: createError(
          'Missing required ThirdWeb credentials (CLIENT_ID or CLIENT_SECRET)',
          'MISSING_CREDENTIALS'
        )
      };
    }

    // Create client configuration
    const config = createClientConfig();
    
    // Create client with error handling
    const safeCreateClient = withErrorHandling(createClient);
    const result = safeCreateClient(config);
    
    return result;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: createError(
        `Unexpected error during client initialization: ${errorMessage}`,
        'INITIALIZATION_ERROR'
      )
    };
  }
};

/**
 * Utility function to extract client from result (for convenience)
 * @param result - LoadThirdwebClientResult
 * @returns ThirdWeb client if successful, throws error if failed
 */
export const getClientOrThrow = (result: LoadThirdwebClientResult): ThirdwebClient => {
  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.client;
};
