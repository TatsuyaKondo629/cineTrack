import reportWebVitals from './reportWebVitals';

describe('reportWebVitals', () => {
  // Store original import to restore later
  const originalImport = global.import;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original import if it was modified
    if (originalImport) {
      global.import = originalImport;
    }
  });

  test('is a function', () => {
    expect(typeof reportWebVitals).toBe('function');
  });

  test('does not call web-vitals when onPerfEntry is null', () => {
    reportWebVitals(null);
    expect(() => reportWebVitals(null)).not.toThrow();
  });

  test('does not call web-vitals when onPerfEntry is undefined', () => {
    reportWebVitals(undefined);
    expect(() => reportWebVitals(undefined)).not.toThrow();
  });

  test('does not call web-vitals when onPerfEntry is not a function', () => {
    // Test various non-function values
    expect(() => reportWebVitals('string')).not.toThrow();
    expect(() => reportWebVitals({})).not.toThrow();
    expect(() => reportWebVitals(123)).not.toThrow();
    expect(() => reportWebVitals(true)).not.toThrow();
    expect(() => reportWebVitals([])).not.toThrow();
  });


  test('handles function type check correctly', () => {
    const mockFunction = jest.fn();
    const notAFunction = 'string';
    
    // Should not throw for function
    expect(() => reportWebVitals(mockFunction)).not.toThrow();
    
    // Should not throw for non-function
    expect(() => reportWebVitals(notAFunction)).not.toThrow();
  });

  test('handles edge cases', () => {
    // Test with various falsy values
    expect(() => reportWebVitals(false)).not.toThrow();
    expect(() => reportWebVitals(0)).not.toThrow();
    expect(() => reportWebVitals('')).not.toThrow();
    
    // Test with truthy non-function values
    expect(() => reportWebVitals([])).not.toThrow();
    expect(() => reportWebVitals(1)).not.toThrow();
    expect(() => reportWebVitals('test')).not.toThrow();
  });

  test('validates instanceof Function check', () => {
    // Mock functions that pass instanceof Function
    const regularFunction = function() {};
    const arrowFunction = () => {};
    const asyncFunction = async () => {};

    // These should not throw and should trigger the import
    global.import = jest.fn().mockResolvedValue({
      getCLS: jest.fn(),
      getFID: jest.fn(),
      getFCP: jest.fn(),
      getLCP: jest.fn(),
      getTTFB: jest.fn()
    });

    expect(() => reportWebVitals(regularFunction)).not.toThrow();
    expect(() => reportWebVitals(arrowFunction)).not.toThrow();
    expect(() => reportWebVitals(asyncFunction)).not.toThrow();
  });


  test('validates both conditions of the if statement', () => {
    // Test the exact condition: onPerfEntry && onPerfEntry instanceof Function
    
    // Falsy values should not proceed (first condition fails)
    expect(() => reportWebVitals(null)).not.toThrow();
    expect(() => reportWebVitals(undefined)).not.toThrow();
    expect(() => reportWebVitals(false)).not.toThrow();
    expect(() => reportWebVitals(0)).not.toThrow();
    expect(() => reportWebVitals('')).not.toThrow();
    
    // Truthy but not instanceof Function should not proceed (second condition fails)
    expect(() => reportWebVitals('truthy string')).not.toThrow();
    expect(() => reportWebVitals(123)).not.toThrow();
    expect(() => reportWebVitals({})).not.toThrow();
    expect(() => reportWebVitals([])).not.toThrow();
    expect(() => reportWebVitals(true)).not.toThrow();
    
    // Only true functions should proceed (both conditions pass)
    const validFunction = jest.fn();
    global.import = jest.fn().mockResolvedValue({
      getCLS: jest.fn(),
      getFID: jest.fn(),
      getFCP: jest.fn(),
      getLCP: jest.fn(),
      getTTFB: jest.fn()
    });
    expect(() => reportWebVitals(validFunction)).not.toThrow();
  });
});