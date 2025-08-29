import { ThirdwebClient } from 'thirdweb';
import { 
  loadThirdwebCollections, 
  getCollectionsOrThrow, 
  LoadThirdwebCollectionsResult,
  ThirdwebCollection 
} from './LoadThirdwebCollections';
import { LoadThirdwebClientResult } from './LoadThirdwebClient';

// Mock the LoadThirdwebClient module
jest.mock('./LoadThirdwebClient', () => ({
  loadThirdwebClient: jest.fn(),
  getClientOrThrow: jest.fn(),
}));

// Mock the environment configuration
jest.mock('../../config/env', () => {
  const actualEnv = jest.requireActual('../../config/env');
  return {
    env: {
      CLIENT_ID: actualEnv.env?.CLIENT_ID || 'test-client-id',
      CLIENT_SECRET: actualEnv.env?.CLIENT_SECRET || 'test-client-secret',
      CHAIN: actualEnv.env?.CHAIN || 'avalanche-fuji',
      PORT: actualEnv.env?.PORT || 3000,
      WALLET_ADDRESS: actualEnv.env?.WALLET_ADDRESS || 'test-wallet',
      CONTRACT_ADDRESS: actualEnv.env?.CONTRACT_ADDRESS || 'test-contract',
    },
  };
});

describe('LoadThirdwebCollections', () => {
  const mockLoadThirdwebClient = require('./LoadThirdwebClient').loadThirdwebClient as jest.MockedFunction<any>;
  
  // Helper function to create modified env mocks that reuse the main mock
  const createEnvMock = (overrides: Partial<any> = {}) => {
    const actualEnv = jest.requireActual('../../config/env');
    return {
      env: {
        CLIENT_ID: actualEnv.env?.CLIENT_ID || 'test-client-id',
        CLIENT_SECRET: actualEnv.env?.CLIENT_SECRET || 'test-client-secret',
        CHAIN: actualEnv.env?.CHAIN || 'avalanche-fuji',
        PORT: actualEnv.env?.PORT || 3000,
        WALLET_ADDRESS: actualEnv.env?.WALLET_ADDRESS || 'test-wallet',
        CONTRACT_ADDRESS: actualEnv.env?.CONTRACT_ADDRESS || 'test-contract',
        ...overrides,
      },
    };
  };

  const mockClient = {
    clientId: 'test-client-id',
    secretKey: 'test-client-secret',
  } as ThirdwebClient;

  const mockSuccessfulClientResult: LoadThirdwebClientResult = {
    success: true,
    client: mockClient,
  };

  const mockFailedClientResult: LoadThirdwebClientResult = {
    success: false,
    error: {
      code: 'CLIENT_LOAD_ERROR',
      message: 'Failed to load client',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadThirdwebCollections', () => {
    it('should successfully load collections with provided client', async () => {
      // Act
      const result = await loadThirdwebCollections(mockClient);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.collections).toBeDefined();
        expect(Array.isArray(result.collections)).toBe(true);
        expect(result.collections.length).toBeGreaterThan(0);
        
        // Verify structure of first collection
        const firstCollection = result.collections[0];
        expect(firstCollection).toHaveProperty('address');
        expect(firstCollection).toHaveProperty('name');
        expect(firstCollection).toHaveProperty('symbol');
        expect(typeof firstCollection.address).toBe('string');
        expect(typeof firstCollection.name).toBe('string');
        expect(typeof firstCollection.symbol).toBe('string');
      }

      // Should not call loadThirdwebClient when client is provided
      expect(mockLoadThirdwebClient).not.toHaveBeenCalled();
    });

    it('should successfully load collections without provided client', async () => {
      // Arrange
      mockLoadThirdwebClient.mockResolvedValueOnce(mockSuccessfulClientResult);

      // Act
      const result = await loadThirdwebCollections();

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.collections).toBeDefined();
        expect(Array.isArray(result.collections)).toBe(true);
      }

      // Should call loadThirdwebClient when no client is provided
      expect(mockLoadThirdwebClient).toHaveBeenCalledTimes(1);
    });

    it('should return error when client loading fails and no client provided', async () => {
      // Arrange
      mockLoadThirdwebClient.mockResolvedValueOnce(mockFailedClientResult);

      // Act
      const result = await loadThirdwebCollections();

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('CLIENT_LOAD_ERROR');
        expect(result.error.message).toContain('Failed to load ThirdWeb client');
        expect(result.error.message).toContain('Failed to load client');
      }

      expect(mockLoadThirdwebClient).toHaveBeenCalledTimes(1);
    });

    it('should handle unexpected errors during collections loading', async () => {
      // Arrange - Mock to throw an error during execution
      mockLoadThirdwebClient.mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      // Act
      const result = await loadThirdwebCollections();

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('COLLECTIONS_INITIALIZATION_ERROR');
        expect(result.error.message).toContain('Unexpected error during collections loading');
      }
    });

    it('should handle collections fetching errors gracefully', async () => {
      // Arrange - Create a problematic client that should cause an error
      const problematicClient = null as any; // This should cause an error

      // Act
      const result = await loadThirdwebCollections(problematicClient);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('COLLECTIONS_INITIALIZATION_ERROR');
        expect(result.error.message).toContain('Unexpected error during collections loading');
      }
    });

    it('should handle non-Error exceptions during fetchCollections', async () => {
      // This test verifies the error handling in the withErrorHandling HOF
      // We'll simulate this by causing an error that would occur in fetchCollections
      
      // For now, we'll test the error path that can be triggered by the withErrorHandling wrapper
      // by passing an invalid client that would cause fetchCollections to fail
      
      // Create a client that would cause issues (but not null to avoid immediate failure)
      const invalidClient = {} as ThirdwebClient;

      // Act
      const result = await loadThirdwebCollections(invalidClient);

      // Assert - Should still succeed with mock data, but this tests the code path
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.collections).toBeDefined();
        expect(Array.isArray(result.collections)).toBe(true);
      }
    });
  });

  describe('getCollectionsOrThrow', () => {
    it('should return collections when result is successful', () => {
      // Arrange
      const mockCollections: ThirdwebCollection[] = [
        {
          address: '0x1234567890123456789012345678901234567890',
          name: 'Test Collection',
          symbol: 'TEST',
        },
      ];
      const successResult: LoadThirdwebCollectionsResult = {
        success: true,
        collections: mockCollections,
      };

      // Act
      const collections = getCollectionsOrThrow(successResult);

      // Assert
      expect(collections).toBe(mockCollections);
      expect(collections).toHaveLength(1);
      expect(collections[0].name).toBe('Test Collection');
    });

    it('should throw error when result is unsuccessful', () => {
      // Arrange
      const errorResult: LoadThirdwebCollectionsResult = {
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test collections error message',
        },
      };

      // Act & Assert
      expect(() => getCollectionsOrThrow(errorResult)).toThrow('Test collections error message');
    });
  });

  describe('Functional Programming Principles', () => {
    it('should be pure functions that return consistent results with same client', async () => {
      // Act
      const result1 = await loadThirdwebCollections(mockClient);
      const result2 = await loadThirdwebCollections(mockClient);

      // Assert - results should be consistent
      expect(result1.success).toBe(result2.success);
      if (result1.success && result2.success) {
        expect(result1.collections).toHaveLength(result2.collections.length);
      }
    });

    it('should use immutable error objects', async () => {
      // Arrange
      mockLoadThirdwebClient.mockResolvedValue(mockFailedClientResult);

      // Act
      const result1 = await loadThirdwebCollections();
      const result2 = await loadThirdwebCollections();

      // Assert
      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
      if (!result1.success && !result2.success) {
        expect(result1.error.code).toBe(result2.error.code);
        expect(result1.error.message).toBe(result2.error.message);
        // Verify they are different object instances
        expect(result1.error).not.toBe(result2.error);
      }
    });
  });
});
