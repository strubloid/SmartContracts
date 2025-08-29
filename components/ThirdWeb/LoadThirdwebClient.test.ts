import { createThirdwebClient, ThirdwebClient } from 'thirdweb';
import { loadThirdwebClient, getClientOrThrow, LoadThirdwebClientResult } from './LoadThirdwebClient';

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

// Mock the thirdweb createThirdwebClient function
jest.mock('thirdweb', () => ({
  createThirdwebClient: jest.fn().mockImplementation((config) => ({
    clientId: config.clientId,
    secretKey: config.secretKey,
    // Mock typical ThirdwebClient properties
    rpc: {},
    storage: {},
  })),
}));

describe('LoadThirdwebClient', () => {
  const mockCreateThirdwebClient = createThirdwebClient as jest.MockedFunction<typeof createThirdwebClient>;

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
        ...overrides, // Override specific values
      },
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadThirdwebClient', () => {
    it('should successfully create a ThirdWeb client with valid credentials', async () => {
      // Act
      const result = await loadThirdwebClient();

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.client).toBeDefined();
        // Use dynamic values that match what the mock will provide
        expect(mockCreateThirdwebClient).toHaveBeenCalledWith({
          clientId: expect.any(String),
          secretKey: expect.any(String),
        });
        // Verify the call was made once
        expect(mockCreateThirdwebClient).toHaveBeenCalledTimes(1);
      }
    });

    it('should return error when CLIENT_ID is missing', async () => {
      // Arrange - Reuse main mock and only override CLIENT_ID
      jest.doMock('../../config/env', () => createEnvMock({ CLIENT_ID: '' }));

      // Clear modules and re-import
      jest.resetModules();
      const { loadThirdwebClient: testLoadThirdwebClient } = await import('./LoadThirdwebClient');

      // Act
      const result = await testLoadThirdwebClient();

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('MISSING_CREDENTIALS');
        expect(result.error.message).toContain('Missing required ThirdWeb credentials');
      }

      // Reset mock
      jest.resetModules();
    });

    it('should return error when CLIENT_SECRET is missing', async () => {
      // Arrange - Reuse main mock and only override CLIENT_SECRET
      jest.doMock('../../config/env', () => createEnvMock({ CLIENT_SECRET: '' }));

      // Clear modules and re-import
      jest.resetModules();
      const { loadThirdwebClient: testLoadThirdwebClient } = await import('./LoadThirdwebClient');

      // Act
      const result = await testLoadThirdwebClient();

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('MISSING_CREDENTIALS');
        expect(result.error.message).toContain('Missing required ThirdWeb credentials');
      }

      // Reset mock
      jest.resetModules();
    });

    it('should handle createThirdwebClient errors gracefully', async () => {
      // Arrange
      mockCreateThirdwebClient.mockImplementationOnce(() => {
        throw new Error('Client creation failed');
      });

      // Act
      const result = await loadThirdwebClient();

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('THIRDWEB_CLIENT_CREATION_ERROR');
        expect(result.error.message).toContain('Failed to create ThirdWeb client');
        expect(result.error.message).toContain('Client creation failed');
      }
    });

    it('should handle non-Error exceptions during client creation', async () => {
      // Arrange
      mockCreateThirdwebClient.mockImplementationOnce(() => {
        throw 'String error'; // Non-Error type exception
      });

      // Act
      const result = await loadThirdwebClient();

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('THIRDWEB_CLIENT_CREATION_ERROR');
        expect(result.error.message).toContain('Failed to create ThirdWeb client');
        expect(result.error.message).toContain('Unknown error occurred');
      }
    });

    it('should handle unexpected initialization errors', async () => {
      // Arrange - Use helper to create a mock that throws an error
      jest.doMock('../../config/env', () => ({
        get env() {
          throw new Error('Environment access error');
        }
      }));

      jest.resetModules();
      const { loadThirdwebClient: testLoadThirdwebClient } = await import('./LoadThirdwebClient');

      // Act
      const result = await testLoadThirdwebClient();

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INITIALIZATION_ERROR');
        expect(result.error.message).toContain('Unexpected error during client initialization');
      }

      // Reset mock
      jest.resetModules();
    });
  });

  describe('getClientOrThrow', () => {
    it('should return client when result is successful', () => {
      // Arrange
      const mockClient = { clientId: 'test', secretKey: 'test' } as ThirdwebClient;
      const successResult: LoadThirdwebClientResult = {
        success: true,
        client: mockClient,
      };

      // Act
      const client = getClientOrThrow(successResult);

      // Assert
      expect(client).toBe(mockClient);
    });

    it('should throw error when result is unsuccessful', () => {
      // Arrange
      const errorResult: LoadThirdwebClientResult = {
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test error message',
        },
      };

      // Act & Assert
      expect(() => getClientOrThrow(errorResult)).toThrow('Test error message');
    });
  });
});
