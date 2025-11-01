import { GoogleFitService } from '../services/googleFitService';
import { WearableDataType } from '../types/wearable';

// Mock fetch globally
global.fetch = jest.fn();

describe('GoogleFitService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exchangeAuthCodeForTokens', () => {
    it('should successfully exchange auth code for tokens', async () => {
      const mockResponse = {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 3600,
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await GoogleFitService.exchangeAuthCodeForTokens(
        'mock_auth_code',
        'http://localhost:3000/callback',
        'mock_client_id',
        'mock_client_secret'
      );

      expect(result).toEqual({
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        expiresIn: 3600,
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );
    });

    it('should handle OAuth token exchange errors', async () => {
      const mockErrorResponse = {
        error: 'invalid_grant',
        error_description: 'Invalid authorization code',
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        json: async () => mockErrorResponse,
      } as Response);

      await expect(
        GoogleFitService.exchangeAuthCodeForTokens(
          'invalid_auth_code',
          'http://localhost:3000/callback',
          'mock_client_id',
          'mock_client_secret'
        )
      ).rejects.toThrow('Google OAuth 토큰 교환 실패: Invalid authorization code');
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh access token', async () => {
      const mockResponse = {
        access_token: 'new_access_token',
        expires_in: 3600,
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await GoogleFitService.refreshAccessToken(
        'mock_refresh_token',
        'mock_client_id',
        'mock_client_secret'
      );

      expect(result).toEqual({
        accessToken: 'new_access_token',
        expiresIn: 3600,
      });
    });
  });

  describe('Data source mapping', () => {
    it('should return correct Google Fit data source IDs', () => {
      // Test private method through reflection
      const getDataSourceId = (GoogleFitService as any).getGoogleFitDataSourceId;
      
      expect(getDataSourceId('heart_rate')).toBe(
        'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm'
      );
      
      expect(getDataSourceId('steps')).toBe(
        'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
      );
      
      expect(getDataSourceId('calories')).toBe(
        'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'
      );
    });

    it('should return correct standard units', () => {
      // Test private method through reflection
      const getStandardUnit = (GoogleFitService as any).getStandardUnit;
      
      expect(getStandardUnit('heart_rate')).toBe('bpm');
      expect(getStandardUnit('steps')).toBe('count');
      expect(getStandardUnit('calories')).toBe('kcal');
      expect(getStandardUnit('weight')).toBe('kg');
    });
  });

  describe('Data conversion', () => {
    it('should convert Google Fit values correctly', () => {
      // Test private method through reflection
      const convertValue = (GoogleFitService as any).convertGoogleFitValue;
      
      // Distance: meters to kilometers
      expect(convertValue(5000, 'distance')).toBe(5);
      
      // Calories: round to integer
      expect(convertValue(250.7, 'calories')).toBe(251);
      
      // Sleep: milliseconds to minutes
      expect(convertValue(480000, 'sleep')).toBe(8);
      
      // Other values: round to 2 decimal places
      expect(convertValue(72.456, 'heart_rate')).toBe(72.46);
    });
  });
});