import { render, screen } from '@/test-utils/test-utils';
import DashboardPage from '../dashboard/page';

// Mock the DashboardLayout component
jest.mock('@/components/layout/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

// Mock the view components
jest.mock('@/components/views/LibraryView', () => ({
  LibraryView: () => <div data-testid="library-view">Library View</div>,
}));

jest.mock('@/components/views/KnowledgeHubView', () => ({
  KnowledgeHubView: () => <div data-testid="knowledge-hub-view">Knowledge Hub View</div>,
}));

jest.mock('@/components/views/LearningLabView', () => ({
  LearningLabView: () => <div data-testid="learning-lab-view">Learning Lab View</div>,
}));

describe('Dashboard Page', () => {
  it('renders the dashboard layout', () => {
    render(<DashboardPage />);

    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Welcome to Mind Vault')).toBeInTheDocument();
  });

  it('renders the three pillar navigation cards', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Hub')).toBeInTheDocument();
    expect(screen.getByText('Learning Lab')).toBeInTheDocument();
  });

  it('renders the recent activity section', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('No recent activity yet')).toBeInTheDocument();
  });

  it('renders action buttons for each pillar', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Browse Library')).toBeInTheDocument();
    expect(screen.getByText('Open Knowledge Hub')).toBeInTheDocument();
    expect(screen.getByText('Enter Learning Lab')).toBeInTheDocument();
  });
});
