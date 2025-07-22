import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Theaters from './Theaters';

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

// Mock timers for debounce testing
jest.useFakeTimers();

const renderWithRouter = () => {
  return render(
    <MemoryRouter>
      <Theaters />
    </MemoryRouter>
  );
};

const mockTheatersData = {
  data: {
    success: true,
    data: [
      {
        id: 1,
        name: 'TOHOシネマズ梅田',
        displayName: 'TOHOシネマズ梅田',
        chain: 'TOHOシネマズ',
        address: '大阪府大阪市北区梅田1-1-1',
        prefecture: '大阪府',
        city: '大阪市',
        phone: '06-1234-5678',
        website: 'https://tohotheater.jp',
        latitude: 34.7024,
        longitude: 135.4959
      },
      {
        id: 2,
        name: 'イオンシネマ新宿',
        displayName: 'イオンシネマ新宿',
        chain: 'イオンシネマ',
        address: '東京都新宿区新宿1-1-1',
        prefecture: '東京都',
        city: '新宿区',
        phone: '03-1234-5678',
        website: 'https://aeoncinema.com',
        latitude: 35.6895,
        longitude: 139.7006
      }
    ]
  }
};

const mockPrefecturesData = {
  data: {
    success: true,
    data: ['大阪府', '東京都', '神奈川県']
  }
};

const mockCitiesData = {
  data: {
    success: true,
    data: ['大阪市', '堺市', '豊中市']
  }
};

const mockChainsData = {
  data: {
    success: true,
    data: ['TOHOシネマズ', 'イオンシネマ', 'ユナイテッド・シネマ']
  }
};

describe('Theaters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGeolocation.getCurrentPosition.mockClear();
    
    // Setup default axios responses
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/theaters/prefectures')) {
        return Promise.resolve(mockPrefecturesData);
      }
      if (url.includes('/theaters/cities')) {
        return Promise.resolve(mockCitiesData);
      }
      if (url.includes('/theaters/chains')) {
        return Promise.resolve(mockChainsData);
      }
      if (url.includes('/theaters/search')) {
        return Promise.resolve(mockTheatersData);
      }
      if (url.includes('/theaters')) {
        return Promise.resolve(mockTheatersData);
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    
    mockedAxios.post.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
  });

  test('renders theaters page', async () => {
    renderWithRouter();
    
    expect(screen.getByText('映画館・上映情報検索')).toBeInTheDocument();
    expect(screen.getByText('お近くの映画館を検索して、上映情報を確認しましょう')).toBeInTheDocument();
  });

  test('loads initial data on mount', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/theaters/prefectures');
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/theaters/chains');
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/api/theaters');
    });
  });

  test('displays search form elements', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('映画館名、チェーン名で検索...')).toBeInTheDocument();
      expect(screen.getAllByText('都道府県')[0]).toBeInTheDocument();
      expect(screen.getAllByText('市区町村')[0]).toBeInTheDocument();
      expect(screen.getAllByText('チェーン')[0]).toBeInTheDocument();
    });
  });

  test('displays theaters after loading', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('TOHOシネマズ梅田')).toBeInTheDocument();
      expect(screen.getByText('イオンシネマ新宿')).toBeInTheDocument();
    });
  });

  test('displays theater information correctly', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('TOHOシネマズ梅田')).toBeInTheDocument();
      expect(screen.getByText('大阪府大阪市北区梅田1-1-1')).toBeInTheDocument();
      expect(screen.getByText('06-1234-5678')).toBeInTheDocument();
      expect(screen.getByText('TOHOシネマズ')).toBeInTheDocument();
    });
  });

  test('performs search with text input', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('TOHOシネマズ梅田')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('映画館名、チェーン名で検索...');
    fireEvent.change(searchInput, { target: { value: '梅田' } });
    
    const searchButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/theaters/search',
        { params: { query: '梅田' } }
      );
    });
  });

  test('filters by prefecture', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('TOHOシネマズ梅田')).toBeInTheDocument();
    });
    
    // Find the prefecture select by accessing the first combobox
    const comboboxes = screen.getAllByRole('combobox');
    const prefectureSelect = comboboxes[0]; // First combobox is prefecture
    fireEvent.mouseDown(prefectureSelect);
    
    await waitFor(() => {
      // Click on the menu option (not the chip)
      const osakaOption = screen.getByRole('option', { name: '大阪府' });
      fireEvent.click(osakaOption);
    });
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/theaters/cities',
        { params: { prefecture: '大阪府' } }
      );
    });
  });

  test('filters by city', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('TOHOシネマズ梅田')).toBeInTheDocument();
    });
    
    // First select prefecture
    const comboboxes = screen.getAllByRole('combobox');
    const prefectureSelect = comboboxes[0]; // First combobox is prefecture
    fireEvent.mouseDown(prefectureSelect);
    
    await waitFor(() => {
      const osakaOption = screen.getByRole('option', { name: '大阪府' });
      fireEvent.click(osakaOption);
    });
    
    // Then select city
    await waitFor(() => {
      const comboboxes = screen.getAllByRole('combobox');
      const citySelect = comboboxes[1]; // Second combobox is city
      fireEvent.mouseDown(citySelect);
    });
    
    await waitFor(() => {
      const osakaCity = screen.getByRole('option', { name: '大阪市' });
      fireEvent.click(osakaCity);
    });
    
    const searchButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/theaters/search',
        { params: { prefecture: '大阪府', city: '大阪市' } }
      );
    });
  });

  test('filters by chain', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('TOHOシネマズ梅田')).toBeInTheDocument();
    });
    
    // Find chain select
    const comboboxes = screen.getAllByRole('combobox');
    const chainSelect = comboboxes[2]; // Third combobox is chain
    fireEvent.mouseDown(chainSelect);
    
    await waitFor(() => {
      const tohoOption = screen.getByRole('option', { name: 'TOHOシネマズ' });
      fireEvent.click(tohoOption);
    });
    
    const searchButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/theaters/search',
        { params: { chain: 'TOHOシネマズ' } }
      );
    });
  });

  test('gets current location', async () => {
    const mockPosition = {
      coords: {
        latitude: 34.6937,
        longitude: 135.5023
      }
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('TOHOシネマズ梅田')).toBeInTheDocument();
    });

    const locationButton = screen.getByRole('button', { name: '現在地周辺を検索' });
    fireEvent.click(locationButton);

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  test('handles geolocation error', async () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error(new Error('Location not available'));
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('TOHOシネマズ梅田')).toBeInTheDocument();
    });

    const locationButton = screen.getByRole('button', { name: '現在地周辺を検索' });
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('位置情報の取得に失敗しました');
    });
    
    mockAlert.mockRestore();
  });

  test('handles browser without geolocation support', async () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Mock browser without geolocation
    Object.defineProperty(global, 'navigator', {
      value: {},
      writable: true
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('TOHOシネマズ梅田')).toBeInTheDocument();
    });

    const locationButton = screen.getByRole('button', { name: '現在地周辺を検索' });
    fireEvent.click(locationButton);

    expect(mockAlert).toHaveBeenCalledWith('お使いのブラウザでは位置情報がサポートされていません');
    
    mockAlert.mockRestore();
    
    // Restore geolocation mock
    Object.defineProperty(global, 'navigator', {
      value: { geolocation: mockGeolocation },
      writable: true
    });
  });

  test('clears all filters', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('TOHOシネマズ梅田')).toBeInTheDocument();
    });
    
    // Set some filters first
    const searchInput = screen.getByPlaceholderText('映画館名、チェーン名で検索...');
    fireEvent.change(searchInput, { target: { value: '梅田' } });
    
    const clearButton = screen.getByRole('button', { name: '条件をクリア' });
    fireEvent.click(clearButton);
    
    expect(searchInput.value).toBe('');
  });

  test('shows loading state during search', async () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter();
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays empty state when no theaters found', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/theaters/prefectures')) {
        return Promise.resolve(mockPrefecturesData);
      }
      if (url.includes('/theaters/chains')) {
        return Promise.resolve(mockChainsData);
      }
      if (url.includes('/theaters')) {
        return Promise.resolve({ data: { success: true, data: [] } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('映画館が見つかりませんでした')).toBeInTheDocument();
      expect(screen.getByText('検索条件を変更するか、デモデータを作成してお試しください')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('映画館データの取得に失敗しました')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  test('handles unsuccessful API responses', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { success: false, message: 'Server error' }
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('映画館データの取得に失敗しました')).toBeInTheDocument();
    });
  });

  test('displays theater without phone number', async () => {
    const theatersWithoutPhone = {
      data: {
        success: true,
        data: [
          {
            id: 1,
            name: 'Theater Without Phone',
            displayName: 'Theater Without Phone',
            chain: 'Test Chain',
            address: '大阪府大阪市北区1-1-1',
            prefecture: '大阪府',
            city: '大阪市'
            // phone missing
          }
        ]
      }
    };
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/theaters/prefectures')) {
        return Promise.resolve(mockPrefecturesData);
      }
      if (url.includes('/theaters/chains')) {
        return Promise.resolve(mockChainsData);
      }
      if (url.includes('/theaters')) {
        return Promise.resolve(theatersWithoutPhone);
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Theater Without Phone')).toBeInTheDocument();
    });
    
    // Should not show phone section
    expect(screen.queryByLabelText('電話')).not.toBeInTheDocument();
  });

  test('displays theater without website', async () => {
    const theatersWithoutWebsite = {
      data: {
        success: true,
        data: [
          {
            id: 1,
            name: 'Theater Without Website',
            displayName: 'Theater Without Website',
            chain: 'Test Chain',
            address: '大阪府大阪市北区1-1-1',
            prefecture: '大阪府',
            city: '大阪市',
            phone: '06-1234-5678'
            // website missing
          }
        ]
      }
    };
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/theaters/prefectures')) {
        return Promise.resolve(mockPrefecturesData);
      }
      if (url.includes('/theaters/chains')) {
        return Promise.resolve(mockChainsData);
      }
      if (url.includes('/theaters')) {
        return Promise.resolve(theatersWithoutWebsite);
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Theater Without Website')).toBeInTheDocument();
    });
    
    // Should not show website section
    expect(screen.queryByLabelText('ウェブサイト')).not.toBeInTheDocument();
  });

  test('handles search with multiple filters', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('TOHOシネマズ梅田')).toBeInTheDocument();
    });
    
    // Set multiple filters
    const searchInput = screen.getByPlaceholderText('映画館名、チェーン名で検索...');
    fireEvent.change(searchInput, { target: { value: '映画館' } });
    
    // Select prefecture
    const comboboxes = screen.getAllByRole('combobox');
    const prefectureSelect = comboboxes[0]; // First combobox is prefecture
    fireEvent.mouseDown(prefectureSelect);
    
    await waitFor(() => {
      const osakaOption = screen.getByRole('option', { name: '大阪府' });
      fireEvent.click(osakaOption);
    });
    
    // Select chain
    await waitFor(() => {
      const comboboxes = screen.getAllByRole('combobox');
      const chainSelect = comboboxes[2]; // Third combobox is chain
      fireEvent.mouseDown(chainSelect);
    });
    
    await waitFor(() => {
      const tohoOption = screen.getByRole('option', { name: 'TOHOシネマズ' });
      fireEvent.click(tohoOption);
    });
    
    // Click the search button to trigger the search
    const searchButton = screen.getByRole('button', { name: '検索' });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/theaters/search',
        { 
          params: { 
            query: '映画館',
            prefecture: '大阪府',
            chain: 'TOHOシネマズ'
          } 
        }
      );
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

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('TOHOシネマズ梅田')).toBeInTheDocument();
    });

    const locationButton = screen.getByRole('button', { name: '現在地周辺を検索' });
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(screen.getByText('現在地周辺で検索中')).toBeInTheDocument();
    });
  });

  test('can remove current location', async () => {
    const mockPosition = {
      coords: {
        latitude: 34.6937,
        longitude: 135.5023
      }
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('TOHOシネマズ梅田')).toBeInTheDocument();
    });

    const locationButton = screen.getByRole('button', { name: '現在地周辺を検索' });
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(screen.getByText('現在地周辺で検索中')).toBeInTheDocument();
    });

    // Click the delete button on the location chip
    const deleteButton = screen.getByTestId('CancelIcon');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('現在地周辺で検索中')).not.toBeInTheDocument();
    });
  });

  test('creates demo data', async () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Setup empty theaters response to show the demo data button
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/theaters/prefectures')) {
        return Promise.resolve(mockPrefecturesData);
      }
      if (url.includes('/theaters/chains')) {
        return Promise.resolve(mockChainsData);
      }
      if (url.includes('/theaters')) {
        return Promise.resolve({ data: { success: true, data: [] } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('デモデータを作成')).toBeInTheDocument();
    });
    
    const demoButton = screen.getByText('デモデータを作成');
    fireEvent.click(demoButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8080/api/theaters/demo-data');
      expect(mockAlert).toHaveBeenCalledWith('デモデータを作成しました');
    });
    
    mockAlert.mockRestore();
  });

  test('handles demo data creation error', async () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Setup empty theaters response and failed demo creation
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/theaters/prefectures')) {
        return Promise.resolve(mockPrefecturesData);
      }
      if (url.includes('/theaters/chains')) {
        return Promise.resolve(mockChainsData);
      }
      if (url.includes('/theaters')) {
        return Promise.resolve({ data: { success: true, data: [] } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    
    mockedAxios.post.mockRejectedValue(new Error('Demo creation failed'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('デモデータを作成')).toBeInTheDocument();
    });
    
    const demoButton = screen.getByText('デモデータを作成');
    fireEvent.click(demoButton);
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('デモデータの作成に失敗しました');
    });
    
    mockAlert.mockRestore();
    consoleSpy.mockRestore();
  });

  test('displays theater with shortAddress', async () => {
    const theatersWithShortAddress = {
      data: {
        success: true,
        data: [
          {
            id: 1,
            name: 'Theater With Short Address',
            displayName: 'Theater With Short Address',
            chain: 'Test Chain',
            address: '大阪府大阪市北区梅田、1-1-1、2F',
            shortAddress: '大阪府大阪市北区',
            prefecture: '大阪府',
            city: '大阪市',
            phone: '06-1234-5678',
            website: 'https://example.com'
          }
        ]
      }
    };
    
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/theaters/prefectures')) {
        return Promise.resolve(mockPrefecturesData);
      }
      if (url.includes('/theaters/chains')) {
        return Promise.resolve(mockChainsData);
      }
      if (url.includes('/theaters')) {
        return Promise.resolve(theatersWithShortAddress);
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Theater With Short Address')).toBeInTheDocument();
      expect(screen.getByText('大阪府大阪市北区')).toBeInTheDocument();
      expect(screen.getByText('大阪府大阪市北区梅田、1-1-1、2F')).toBeInTheDocument();
    });
  });
});