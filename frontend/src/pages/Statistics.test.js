import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Statistics from './Statistics';

// Mock recharts components
jest.mock('recharts', () => ({
  BarChart: ({ children, ...props }) => <div data-testid="bar-chart" {...props}>{children}</div>,
  Bar: (props) => <div data-testid="bar" {...props} />,
  XAxis: (props) => <div data-testid="x-axis" {...props} />,
  YAxis: (props) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: (props) => <div data-testid="cartesian-grid" {...props} />,
  Tooltip: (props) => <div data-testid="tooltip" {...props} />,
  Legend: (props) => <div data-testid="legend" {...props} />,
  PieChart: ({ children, ...props }) => <div data-testid="pie-chart" {...props}>{children}</div>,
  Pie: (props) => <div data-testid="pie" {...props} />,
  Cell: (props) => <div data-testid="cell" {...props} />,
  ResponsiveContainer: ({ children, ...props }) => <div data-testid="responsive-container" {...props}>{children}</div>,
  LineChart: ({ children, ...props }) => <div data-testid="line-chart" {...props}>{children}</div>,
  Line: (props) => <div data-testid="line" {...props} />
}));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.reject(new Error('No authentication token found'))),
  defaults: {
    headers: {
      common: {}
    }
  }
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Statistics Component', () => {
  test('renders statistics page header', () => {
    renderWithProviders(<Statistics />);
    
    expect(screen.getByText('統計・分析')).toBeInTheDocument();
    expect(screen.getByText('あなたの映画視聴データを詳しく分析します')).toBeInTheDocument();
  });

  test('shows loading spinner initially', () => {
    renderWithProviders(<Statistics />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders all statistics cards', async () => {
    renderWithProviders(<Statistics />);
    
    // Wait for loading to complete
    await screen.findByText('総視聴映画数');
    
    expect(screen.getByText('総視聴映画数')).toBeInTheDocument();
    expect(screen.getByText('平均評価')).toBeInTheDocument();
    expect(screen.getByText('月あたり視聴数')).toBeInTheDocument();
    expect(screen.getByText('視聴期間（日）')).toBeInTheDocument();
  });

  test('renders chart sections', async () => {
    renderWithProviders(<Statistics />);
    
    // Wait for loading to complete
    await screen.findByText('月別視聴数');
    
    expect(screen.getByText('月別視聴数')).toBeInTheDocument();
    expect(screen.getByText('ジャンル分布')).toBeInTheDocument();
    expect(screen.getByText('評価分布')).toBeInTheDocument();
    expect(screen.getByText('視聴傾向')).toBeInTheDocument();
  });

  test('renders charts with recharts components', async () => {
    renderWithProviders(<Statistics />);
    
    // Wait for loading to complete and check for chart components
    await screen.findByText('月別視聴数');
    
    // Check if recharts components are rendered
    expect(screen.getAllByTestId('responsive-container')).toHaveLength(4);
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});