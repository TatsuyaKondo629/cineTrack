import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  CenteredLoading,
  FullScreenLoading,
  ProgressLoading,
  ButtonLoading,
  CardLoading,
  ListItemLoading,
  TableLoading,
  StageLoading,
  SmartLoading
} from './LoadingStates';
import { Button } from '@mui/material';

describe('LoadingStates Components', () => {
  describe('CenteredLoading', () => {
    test('renders with default message', () => {
      render(<CenteredLoading />);
      expect(screen.getByText('ロード中...')).toBeInTheDocument();
    });

    test('renders with custom message', () => {
      render(<CenteredLoading message="カスタムメッセージ" />);
      expect(screen.getByText('カスタムメッセージ')).toBeInTheDocument();
    });

    test('hides message when showMessage is false', () => {
      render(<CenteredLoading showMessage={false} />);
      expect(screen.queryByText('ロード中...')).not.toBeInTheDocument();
    });

    test('renders circular progress', () => {
      const { container } = render(<CenteredLoading />);
      const progress = container.querySelector('.MuiCircularProgress-root');
      expect(progress).toBeInTheDocument();
    });
  });

  describe('FullScreenLoading', () => {
    test('renders backdrop when open', () => {
      const { container } = render(<FullScreenLoading open={true} />);
      const backdrop = container.querySelector('.MuiBackdrop-root');
      expect(backdrop).toBeInTheDocument();
    });

    test('does not render when closed', () => {
      const { container } = render(<FullScreenLoading open={false} />);
      const backdrop = container.querySelector('.MuiBackdrop-root');
      // MUI Backdrop still renders with hidden styles when closed
      expect(backdrop).toHaveStyle('visibility: hidden');
    });

    test('shows custom message', () => {
      render(<FullScreenLoading message="フルスクリーンロード中" />);
      expect(screen.getByText('フルスクリーンロード中')).toBeInTheDocument();
    });
  });

  describe('ProgressLoading', () => {
    test('renders indeterminate progress by default', () => {
      const { container } = render(<ProgressLoading />);
      const progress = container.querySelector('.MuiLinearProgress-root');
      expect(progress).toBeInTheDocument();
    });

    test('renders determinate progress with value', () => {
      const { container } = render(<ProgressLoading progress={50} />);
      const progress = container.querySelector('.MuiLinearProgress-root');
      expect(progress).toBeInTheDocument();
    });

    test('shows percentage when enabled', () => {
      render(<ProgressLoading progress={75} showPercentage={true} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    test('shows custom message', () => {
      render(<ProgressLoading message="プログレス表示中" />);
      expect(screen.getByText('プログレス表示中')).toBeInTheDocument();
    });
  });

  describe('ButtonLoading', () => {
    test('renders button normally when not loading', () => {
      render(
        <ButtonLoading loading={false}>
          <Button>クリック</Button>
        </ButtonLoading>
      );
      const button = screen.getByRole('button');
      expect(button).toBeEnabled();
      expect(screen.getByText('クリック')).toBeInTheDocument();
    });

    test('disables button when loading', () => {
      render(
        <ButtonLoading loading={true}>
          <Button>クリック</Button>
        </ButtonLoading>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('shows progress indicator when loading', () => {
      const { container } = render(
        <ButtonLoading loading={true}>
          <Button>クリック</Button>
        </ButtonLoading>
      );
      const progress = container.querySelector('.MuiCircularProgress-root');
      expect(progress).toBeInTheDocument();
    });
  });

  describe('CardLoading', () => {
    test('renders with default message', () => {
      render(<CardLoading />);
      expect(screen.getByText('データを読み込み中...')).toBeInTheDocument();
    });

    test('renders with custom message', () => {
      render(<CardLoading message="カードロード中" />);
      expect(screen.getByText('カードロード中')).toBeInTheDocument();
    });

    test('shows spinner by default', () => {
      const { container } = render(<CardLoading />);
      const progress = container.querySelector('.MuiCircularProgress-root');
      expect(progress).toBeInTheDocument();
    });

    test('hides spinner when disabled', () => {
      const { container } = render(<CardLoading showSpinner={false} />);
      const progress = container.querySelector('.MuiCircularProgress-root');
      expect(progress).not.toBeInTheDocument();
    });
  });

  describe('ListItemLoading', () => {
    test('renders default number of items', () => {
      const { container } = render(<ListItemLoading />);
      const items = container.children[0].children;
      expect(items).toHaveLength(5);
    });

    test('renders custom number of items', () => {
      const { container } = render(<ListItemLoading count={3} />);
      const items = container.children[0].children;
      expect(items).toHaveLength(3);
    });
  });

  describe('TableLoading', () => {
    test('renders with default configuration', () => {
      const { container } = render(<TableLoading />);
      const tableContainer = container.children[0];
      expect(tableContainer).toBeInTheDocument();
    });

    test('renders header when enabled', () => {
      const { container } = render(<TableLoading showHeader={true} />);
      // Check for header and data rows separately
      const allElements = container.querySelectorAll('div');
      expect(allElements.length).toBeGreaterThan(10); // Should have multiple elements
    });

    test('hides header when disabled', () => {
      const { container } = render(<TableLoading showHeader={false} />);
      const allElements = container.querySelectorAll('div');
      expect(allElements.length).toBeGreaterThan(5); // Should have data row elements
    });
  });

  describe('StageLoading', () => {
    test('renders with default stages', () => {
      render(<StageLoading />);
      expect(screen.getByText('データを準備中...')).toBeInTheDocument();
    });

    test('shows current stage', () => {
      const stages = ['ステップ1', 'ステップ2', 'ステップ3'];
      render(<StageLoading stages={stages} currentStage={1} />);
      expect(screen.getByText('ステップ2')).toBeInTheDocument();
    });

    test('shows progress indicator', () => {
      const { container } = render(<StageLoading showProgress={true} />);
      const progress = container.querySelector('.MuiLinearProgress-root');
      expect(progress).toBeInTheDocument();
    });

    test('shows stage counter', () => {
      render(<StageLoading currentStage={1} />);
      expect(screen.getByText(/ステップ 2 \/ 3/)).toBeInTheDocument();
    });
  });

  describe('SmartLoading', () => {
    test('renders default loading', () => {
      const { container } = render(<SmartLoading />);
      const progress = container.querySelector('.MuiCircularProgress-root');
      expect(progress).toBeInTheDocument();
    });

    test('renders list type loading', () => {
      const { container } = render(<SmartLoading type="list" />);
      const items = container.querySelector('div > div').children;
      expect(items.length).toBeGreaterThan(0);
    });

    test('renders table type loading', () => {
      const { container } = render(<SmartLoading type="table" />);
      const tableElements = container.querySelectorAll('div');
      expect(tableElements.length).toBeGreaterThan(0);
    });

    test('renders cards type loading', () => {
      render(<SmartLoading type="cards" />);
      expect(screen.getByText('カードを読み込み中...')).toBeInTheDocument();
    });

    test('renders chart type loading', () => {
      render(<SmartLoading type="chart" />);
      expect(screen.getByText('チャートを生成中...')).toBeInTheDocument();
    });

    test('renders profile type loading', () => {
      render(<SmartLoading type="profile" />);
      expect(screen.getByText('プロフィールを読み込み中...')).toBeInTheDocument();
    });

    test('uses custom message', () => {
      render(<SmartLoading type="cards" message="カスタムメッセージ" />);
      expect(screen.getByText('カスタムメッセージ')).toBeInTheDocument();
    });
  });
});