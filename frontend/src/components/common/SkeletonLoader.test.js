import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  MovieCardSkeleton,
  StatsCardSkeleton,
  ActivityListSkeleton,
  UserProfileSkeleton,
  ChartSkeleton,
  TableSkeleton,
  PageSkeleton
} from './SkeletonLoader';

describe('SkeletonLoader Components', () => {
  describe('MovieCardSkeleton', () => {
    test('renders default number of movie card skeletons', () => {
      const { container } = render(<MovieCardSkeleton />);
      const skeletons = container.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    test('renders custom number of movie card skeletons', () => {
      render(<MovieCardSkeleton count={3} />);
      const cards = screen.getAllByRole('generic').filter(el => 
        el.className.includes('MuiCard-root')
      );
      expect(cards).toHaveLength(3);
    });
  });

  describe('StatsCardSkeleton', () => {
    test('renders default number of stats card skeletons', () => {
      const { container } = render(<StatsCardSkeleton />);
      const cards = container.querySelectorAll('.MuiCard-root');
      expect(cards).toHaveLength(3);
    });

    test('renders custom number of stats card skeletons', () => {
      const { container } = render(<StatsCardSkeleton count={5} />);
      const cards = container.querySelectorAll('.MuiCard-root');
      expect(cards).toHaveLength(5);
    });
  });

  describe('ActivityListSkeleton', () => {
    test('renders default number of activity list skeletons', () => {
      const { container } = render(<ActivityListSkeleton />);
      const cards = container.querySelectorAll('.MuiCard-root');
      expect(cards).toHaveLength(5);
    });

    test('renders custom number of activity list skeletons', () => {
      const { container } = render(<ActivityListSkeleton count={3} />);
      const cards = container.querySelectorAll('.MuiCard-root');
      expect(cards).toHaveLength(3);
    });
  });

  describe('UserProfileSkeleton', () => {
    test('renders user profile skeleton structure', () => {
      const { container } = render(<UserProfileSkeleton />);
      const skeletons = container.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(10); // Multiple skeleton elements
    });

    test('renders within container', () => {
      const { container } = render(<UserProfileSkeleton />);
      const containerElement = container.querySelector('.MuiContainer-root');
      expect(containerElement).toBeInTheDocument();
    });
  });

  describe('ChartSkeleton', () => {
    test('renders with default height', () => {
      const { container } = render(<ChartSkeleton />);
      const chartSkeleton = container.querySelector('.MuiSkeleton-rectangular');
      expect(chartSkeleton).toBeInTheDocument();
    });

    test('renders with custom height', () => {
      const customHeight = 400;
      const { container } = render(<ChartSkeleton height={customHeight} />);
      const chartSkeleton = container.querySelector('.MuiSkeleton-rectangular');
      expect(chartSkeleton).toHaveStyle(`height: ${customHeight}px`);
    });
  });

  describe('TableSkeleton', () => {
    test('renders with default rows and columns', () => {
      const { container } = render(<TableSkeleton />);
      const skeletons = container.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    test('renders with custom rows and columns', () => {
      const { container } = render(<TableSkeleton rows={3} columns={2} />);
      // Header + 3 rows = 4 rows total, each with 2 columns = 8 skeletons
      const skeletons = container.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons).toHaveLength(8);
    });
  });

  describe('PageSkeleton', () => {
    test('renders with default configuration', () => {
      const { container } = render(<PageSkeleton />);
      const containerElement = container.querySelector('.MuiContainer-root');
      expect(containerElement).toBeInTheDocument();
    });

    test('shows header when showHeader is true', () => {
      const { container } = render(<PageSkeleton showHeader={true} />);
      const skeletons = container.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    test('shows stats when showStats is true', () => {
      const { container } = render(<PageSkeleton showStats={true} />);
      const cards = container.querySelectorAll('.MuiCard-root');
      expect(cards.length).toBeGreaterThan(0);
    });

    test('renders cards content type', () => {
      const { container } = render(<PageSkeleton contentType="cards" />);
      const gridContainer = container.querySelector('.MuiGrid-container');
      expect(gridContainer).toBeInTheDocument();
    });

    test('renders list content type', () => {
      const { container } = render(<PageSkeleton contentType="list" />);
      const cards = container.querySelectorAll('.MuiCard-root');
      expect(cards.length).toBeGreaterThan(0);
    });

    test('renders table content type', () => {
      const { container } = render(<PageSkeleton contentType="table" />);
      const skeletons = container.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});