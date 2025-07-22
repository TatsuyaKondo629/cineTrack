// Mock ReactDOM before importing index
const mockRender = jest.fn();
const mockCreateRoot = jest.fn(() => ({ render: mockRender }));

jest.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot
}));

// Mock App component with a simple mock
jest.mock('./App', () => () => 'MockedApp');

// Mock reportWebVitals
const mockReportWebVitals = jest.fn();
jest.mock('./reportWebVitals', () => mockReportWebVitals);

// Mock document.getElementById
const mockElement = { id: 'root' };
const mockGetElementById = jest.fn(() => mockElement);
Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  writable: true
});

describe('index.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Reset mocks state
    mockCreateRoot.mockReturnValue({ render: mockRender });
    mockGetElementById.mockReturnValue(mockElement);
  });

  test('creates root element and renders App', () => {
    // Import index.js to execute it
    require('./index');

    // Verify createRoot was called with correct element
    expect(mockGetElementById).toHaveBeenCalledWith('root');
    expect(mockCreateRoot).toHaveBeenCalledWith(mockElement);

    // Verify render was called
    expect(mockRender).toHaveBeenCalledTimes(1);

    // Verify reportWebVitals was called
    expect(mockReportWebVitals).toHaveBeenCalledWith();
  });

  test('calls reportWebVitals without arguments', () => {
    require('./index');
    
    expect(mockReportWebVitals).toHaveBeenCalledWith();
  });
});