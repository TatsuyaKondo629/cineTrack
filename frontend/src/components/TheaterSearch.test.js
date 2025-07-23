import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import TheaterSearch from './TheaterSearch';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn()
};

Object.defineProperty(global, 'navigator', {
  value: {
    geolocation: mockGeolocation
  },
  writable: true
});

// Mock console.error
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

// Mock timers for debounce testing
jest.useFakeTimers();

describe('TheaterSearch Component', () => {
  const mockOnTheaterSelect = jest.fn();
  
  const mockTheaterData = [
    {
      id: 1,
      name: 'シネマコンプレックス',
      displayName: 'シネマコンプレックス梅田',
      chain: 'TOHOシネマズ',
      address: '大阪府大阪市北区梅田1-1-1',
      shortAddress: '大阪府大阪市'
    },
    {
      id: 2,
      name: 'イオンシネマ',
      displayName: 'イオンシネマ新宿',
      chain: 'イオンシネマ',
      address: '東京都新宿区新宿1-1-1',
      shortAddress: '東京都新宿区'
    }
  ];

  const mockPrefectures = ['大阪府', '東京都', '神奈川県'];
  const mockChains = ['TOHOシネマズ', 'イオンシネマ', 'ユナイテッド・シネマ'];

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnTheaterSelect.mockClear();
    mockGeolocation.getCurrentPosition.mockClear();
    
    // Setup default axios responses
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/theaters/prefectures')) {
        return Promise.resolve({
          data: { success: true, data: mockPrefectures }
        });
      }
      if (url.includes('/theaters/chains')) {
        return Promise.resolve({
          data: { success: true, data: mockChains }
        });
      }
      if (url.includes('/theaters/search') || url.includes('/theaters')) {
        return Promise.resolve({
          data: { success: true, data: mockTheaterData }
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
  });

  describe('Basic Rendering - Dropdown Variant', () => {


    test('loads initial metadata on mount', async () => {
      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/theaters/prefectures');
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/theaters/chains');
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/theaters');
      });
    });


  });

  describe('List Variant', () => {
    test('renders list variant correctly', async () => {
      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
          variant="dialog"
        />
      );

      expect(screen.getByPlaceholderText('映画館名、チェーン名で検索...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('シネマコンプレックス梅田')).toBeInTheDocument();
        expect(screen.getByText('イオンシネマ新宿')).toBeInTheDocument();
      });
    });

    test('handles theater selection in list variant', async () => {
      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
          variant="dialog"
        />
      );

      await waitFor(() => {
        const theaterButton = screen.getByText('シネマコンプレックス梅田');
        fireEvent.click(theaterButton);
      });

      expect(mockOnTheaterSelect).toHaveBeenCalledWith(mockTheaterData[0]);
    });

    test('displays no theaters found message when empty', async () => {
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/theaters/prefectures')) {
          return Promise.resolve({
            data: { success: true, data: mockPrefectures }
          });
        }
        if (url.includes('/theaters/chains')) {
          return Promise.resolve({
            data: { success: true, data: mockChains }
          });
        }
        if (url.includes('/theaters/search') || url.includes('/theaters')) {
          return Promise.resolve({
            data: { success: true, data: [] }
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
          variant="dialog"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('映画館が見つかりませんでした')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    test('performs search when typing in search box', async () => {
      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('映画館名で検索...');
        fireEvent.change(searchInput, { target: { value: '梅田' } });
      });

      // Fast-forward debounce timer
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'http://localhost:8080/api/theaters/search',
          { params: { query: '梅田' } }
        );
      });
    });



    test('clears filters when clear button is clicked', async () => {
      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      // Set some filters first
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('映画館名で検索...');
        fireEvent.change(searchInput, { target: { value: '梅田' } });
      });

      await waitFor(() => {
        const clearButton = screen.getByLabelText('条件をクリア');
        fireEvent.click(clearButton);
      });

      const searchInput = screen.getByPlaceholderText('映画館名で検索...');
      expect(searchInput.value).toBe('');
    });
  });

  describe('Geolocation Functionality', () => {
    test('gets current location when location button is clicked', async () => {
      const mockPosition = {
        coords: {
          latitude: 34.6937,
          longitude: 135.5023
        }
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      await waitFor(() => {
        const locationButton = screen.getByLabelText('現在地周辺を検索');
        fireEvent.click(locationButton);
      });

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'http://localhost:8080/api/theaters/search',
          { 
            params: { 
              latitude: 34.6937, 
              longitude: 135.5023, 
              radius: 10 
            } 
          }
        );
      });
    });

    test('handles geolocation error', async () => {
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(new Error('Location not available'));
      });

      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      await waitFor(() => {
        const locationButton = screen.getByLabelText('現在地周辺を検索');
        fireEvent.click(locationButton);
      });

      expect(mockAlert).toHaveBeenCalledWith('位置情報の取得に失敗しました');
      
      mockAlert.mockRestore();
    });

    test('handles browser without geolocation support', async () => {
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      // Mock browser without geolocation
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true
      });

      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      await waitFor(() => {
        const locationButton = screen.getByLabelText('現在地周辺を検索');
        fireEvent.click(locationButton);
      });

      expect(mockAlert).toHaveBeenCalledWith('お使いのブラウザでは位置情報がサポートされていません');
      
      mockAlert.mockRestore();
      
      // Restore geolocation mock
      Object.defineProperty(global, 'navigator', {
        value: { geolocation: mockGeolocation },
        writable: true
      });
    });

    test('displays current location chip when location is set', async () => {
      const mockPosition = {
        coords: {
          latitude: 34.6937,
          longitude: 135.5023
        }
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      await waitFor(() => {
        const locationButton = screen.getByLabelText('現在地周辺を検索');
        fireEvent.click(locationButton);
      });

      await waitFor(() => {
        expect(screen.getByText('現在地周辺で検索中')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('displays error when API call fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('映画館データの取得に失敗しました')).toBeInTheDocument();
      });
    });

    test('displays error when API returns unsuccessful response', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { success: false, message: 'Server error' }
      });

      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('映画館データの取得に失敗しました')).toBeInTheDocument();
      });
    });

    test('handles search error', async () => {
      // Initial load successful
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/theaters/prefectures')) {
          return Promise.resolve({
            data: { success: true, data: mockPrefectures }
          });
        }
        if (url.includes('/theaters/chains')) {
          return Promise.resolve({
            data: { success: true, data: mockChains }
          });
        }
        if (url.includes('/theaters') && !url.includes('search')) {
          return Promise.resolve({
            data: { success: true, data: mockTheaterData }
          });
        }
        if (url.includes('/theaters/search')) {
          return Promise.reject(new Error('Search failed'));
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('映画館名で検索...');
        fireEvent.change(searchInput, { target: { value: '検索' } });
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(screen.getByText('検索に失敗しました')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('displays loading indicator during data fetch', async () => {
      // Mock slow response
      mockedAxios.get.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              data: { success: true, data: mockTheaterData }
            });
          }, 1000);
        });
      });

      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
          variant="dialog"
        />
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('displays location loading state', async () => {
      let mockCallback;
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        mockCallback = success;
        // Don't call success immediately to simulate loading
      });

      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      await waitFor(() => {
        const locationButton = screen.getByLabelText('現在地周辺を検索');
        fireEvent.click(locationButton);
      });

      // Should show loading state
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Selected Theater Display', () => {
    test('shows selected theater in dropdown', async () => {
      render(
        <TheaterSearch 
          selectedTheater={mockTheaterData[0]}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      await waitFor(() => {
        const selectElement = screen.getByDisplayValue('1');
        expect(selectElement).toBeInTheDocument();
      });
    });

    test('highlights selected theater in list variant', async () => {
      render(
        <TheaterSearch 
          selectedTheater={mockTheaterData[0]}
          onTheaterSelect={mockOnTheaterSelect}
          variant="dialog"
        />
      );

      await waitFor(() => {
        const selectedItem = screen.getByText('シネマコンプレックス梅田').closest('.Mui-selected');
        expect(selectedItem).toBeInTheDocument();
      });
    });
  });

  describe('Component Lifecycle', () => {
    test('cleans up timeouts on unmount', () => {
      const { unmount } = render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      unmount();
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
      
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Additional Function Coverage Tests', () => {

    test('handles search with unsuccessful response', async () => {
      // Setup initial successful load
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/theaters/prefectures')) {
          return Promise.resolve({
            data: { success: true, data: mockPrefectures }
          });
        }
        if (url.includes('/theaters/chains')) {
          return Promise.resolve({
            data: { success: true, data: mockChains }
          });
        }
        if (url.includes('/theaters') && !url.includes('search')) {
          return Promise.resolve({
            data: { success: true, data: mockTheaterData }
          });
        }
        if (url.includes('/theaters/search')) {
          return Promise.resolve({
            data: { success: false } // Unsuccessful response
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('映画館名で検索...');
        fireEvent.change(searchInput, { target: { value: '検索' } });
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should trigger line 142 (unsuccessful search response)
      await waitFor(() => {
        expect(screen.getByText('検索に失敗しました')).toBeInTheDocument();
      });
    });





    test('handles search input change in dialog variant', async () => {
      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
          variant="dialog"
        />
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('映画館名、チェーン名で検索...');
        fireEvent.change(searchInput, { target: { value: '映画館' } });
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should trigger lines 344-356 (search input change in dialog variant)
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'http://localhost:8080/api/theaters/search',
          { params: { query: '映画館' } }
        );
      });
    });


    test('handles search button click in dropdown variant', async () => {
      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      await waitFor(() => {
        const searchButtons = screen.getAllByRole('button');
        const manualSearchButton = searchButtons.find(btn => 
          btn.getAttribute('aria-label') === null && 
          btn.querySelector('svg')?.getAttribute('data-testid') === 'SearchIcon'
        );
        fireEvent.click(manualSearchButton);
      });

      // Should trigger manual search call (line 305)
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/theaters/search', { params: {} });
      });
    });

    test('handles search button click in dialog variant', async () => {
      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
          variant="dialog"
        />
      );

      await waitFor(() => {
        const searchButtons = screen.getAllByRole('button');
        const manualSearchButton = searchButtons.find(btn => 
          btn.getAttribute('aria-label') === null && 
          btn.querySelector('svg')?.getAttribute('data-testid') === 'SearchIcon'
        );
        fireEvent.click(manualSearchButton);
      });

      // Should trigger manual search call (line 404)
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/theaters/search', { params: {} });
      });
    });


    test('clears location chip in dropdown variant', async () => {
      const mockPosition = {
        coords: {
          latitude: 34.6937,
          longitude: 135.5023
        }
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
        />
      );

      // Get location first
      await waitFor(() => {
        const locationButton = screen.getByLabelText('現在地周辺を検索');
        fireEvent.click(locationButton);
      });

      await waitFor(() => {
        expect(screen.getByText('現在地周辺で検索中')).toBeInTheDocument();
      });

      // Delete location chip - should trigger line 318
      const deleteButton = screen.getByTestId('CancelIcon');
      fireEvent.click(deleteButton);

      // Location should be cleared
      expect(screen.queryByText('現在地周辺で検索中')).not.toBeInTheDocument();
    });












    test('covers location chip deletion - line 416', async () => {
      const mockPosition = {
        coords: { latitude: 34.6937, longitude: 135.5023 }
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      render(
        <TheaterSearch 
          selectedTheater={null}
          onTheaterSelect={mockOnTheaterSelect}
          variant="dialog"
        />
      );

      // Set location
      await waitFor(() => {
        const locationButton = screen.getAllByLabelText('現在地周辺を検索')[0];
        fireEvent.click(locationButton);
      });

      await waitFor(() => {
        expect(screen.getByText('現在地周辺で検索中')).toBeInTheDocument();
      });

      // Delete chip to cover line 416
      const chip = screen.getByText('現在地周辺で検索中').closest('[role="button"]');
      const deleteIcon = chip.querySelector('[data-testid="CancelIcon"]');
      fireEvent.click(deleteIcon);

      await waitFor(() => {
        expect(screen.queryByText('現在地周辺で検索中')).not.toBeInTheDocument();
      });
    });






  });
});