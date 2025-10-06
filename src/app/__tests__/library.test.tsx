import { render, screen } from '@/test-utils/test-utils';
import LibraryPage from '../library/page';

// Mock the DashboardLayout component
jest.mock('@/components/layout/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

// Mock the LibraryView component
jest.mock('@/components/views/LibraryView', () => ({
  LibraryView: () => <div data-testid="library-view">Library View</div>,
}));

describe('Library Page', () => {
  it('renders the dashboard layout', () => {
    render(<LibraryPage />);

    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
  });

  it('renders the library view', () => {
    render(<LibraryPage />);

    expect(screen.getByTestId('library-view')).toBeInTheDocument();
  });
});
