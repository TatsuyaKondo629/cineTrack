// Mock web-vitals module before importing reportWebVitals
const mockGetCLS = jest.fn();
const mockGetFID = jest.fn();
const mockGetFCP = jest.fn();
const mockGetLCP = jest.fn();
const mockGetTTFB = jest.fn();

jest.mock('web-vitals', () => ({
  getCLS: mockGetCLS,
  getFID: mockGetFID,
  getFCP: mockGetFCP,
  getLCP: mockGetLCP,
  getTTFB: mockGetTTFB
}));

import reportWebVitals from './reportWebVitals';

describe('reportWebVitals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls all web vitals functions when onPerfEntry is a function', async () => {
    const mockOnPerfEntry = jest.fn();

    await reportWebVitals(mockOnPerfEntry);

    expect(mockGetCLS).toHaveBeenCalledWith(mockOnPerfEntry);
    expect(mockGetFID).toHaveBeenCalledWith(mockOnPerfEntry);
    expect(mockGetFCP).toHaveBeenCalledWith(mockOnPerfEntry);
    expect(mockGetLCP).toHaveBeenCalledWith(mockOnPerfEntry);
    expect(mockGetTTFB).toHaveBeenCalledWith(mockOnPerfEntry);
  });

  test('does not call web vitals functions when onPerfEntry is null', async () => {
    await reportWebVitals(null);

    // Wait for potential dynamic import
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockGetCLS).not.toHaveBeenCalled();
    expect(mockGetFID).not.toHaveBeenCalled();
    expect(mockGetFCP).not.toHaveBeenCalled();
    expect(mockGetLCP).not.toHaveBeenCalled();
    expect(mockGetTTFB).not.toHaveBeenCalled();
  });

  test('does not call web vitals functions when onPerfEntry is undefined', async () => {
    await reportWebVitals(undefined);

    // Wait for potential dynamic import
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockGetCLS).not.toHaveBeenCalled();
    expect(mockGetFID).not.toHaveBeenCalled();
    expect(mockGetFCP).not.toHaveBeenCalled();
    expect(mockGetLCP).not.toHaveBeenCalled();
    expect(mockGetTTFB).not.toHaveBeenCalled();
  });

  test('does not call web vitals functions when onPerfEntry is not a function', async () => {
    await reportWebVitals('not a function');

    // Wait for potential dynamic import
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockGetCLS).not.toHaveBeenCalled();
    expect(mockGetFID).not.toHaveBeenCalled();
    expect(mockGetFCP).not.toHaveBeenCalled();
    expect(mockGetLCP).not.toHaveBeenCalled();
    expect(mockGetTTFB).not.toHaveBeenCalled();
  });

  test('does not call web vitals functions when onPerfEntry is an object', async () => {
    await reportWebVitals({});

    // Wait for potential dynamic import
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockGetCLS).not.toHaveBeenCalled();
    expect(mockGetFID).not.toHaveBeenCalled();
    expect(mockGetFCP).not.toHaveBeenCalled();
    expect(mockGetLCP).not.toHaveBeenCalled();
    expect(mockGetTTFB).not.toHaveBeenCalled();
  });

  test('works with console.log as callback', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await reportWebVitals(console.log);

    expect(mockGetCLS).toHaveBeenCalledWith(console.log);
    expect(mockGetFID).toHaveBeenCalledWith(console.log);
    expect(mockGetFCP).toHaveBeenCalledWith(console.log);
    expect(mockGetLCP).toHaveBeenCalledWith(console.log);
    expect(mockGetTTFB).toHaveBeenCalledWith(console.log);

    consoleSpy.mockRestore();
  });
});