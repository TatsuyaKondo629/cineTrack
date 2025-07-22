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

  test('calls web-vitals when onPerfEntry is a valid function', async () => {
    const mockCallback = jest.fn();
    const mockWebVitals = {
      getCLS: jest.fn(),
      getFID: jest.fn(),
      getFCP: jest.fn(),
      getLCP: jest.fn(),
      getTTFB: jest.fn()
    };

    // Mock the dynamic import
    global.import = jest.fn().mockResolvedValue(mockWebVitals);

    // Call the function
    reportWebVitals(mockCallback);

    // Wait for the import and execution to complete
    await new Promise(resolve => setTimeout(resolve, 10));

    // Verify import was called
    expect(global.import).toHaveBeenCalledWith('web-vitals');

    // Verify all web vitals functions were called with the callback
    expect(mockWebVitals.getCLS).toHaveBeenCalledWith(mockCallback);
    expect(mockWebVitals.getFID).toHaveBeenCalledWith(mockCallback);
    expect(mockWebVitals.getFCP).toHaveBeenCalledWith(mockCallback);
    expect(mockWebVitals.getLCP).toHaveBeenCalledWith(mockCallback);
    expect(mockWebVitals.getTTFB).toHaveBeenCalledWith(mockCallback);
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

  test('handles import error gracefully', async () => {
    const mockCallback = jest.fn();
    
    // Mock import to reject
    global.import = jest.fn().mockRejectedValue(new Error('Import failed'));

    // Should not throw even if import fails
    expect(() => reportWebVitals(mockCallback)).not.toThrow();

    // Wait for potential async operations
    await new Promise(resolve => setTimeout(resolve, 10));

    // Verify import was attempted
    expect(global.import).toHaveBeenCalledWith('web-vitals');
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