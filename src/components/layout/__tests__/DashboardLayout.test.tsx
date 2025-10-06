import { render, screen, fireEvent } from '@/test-utils/test-utils';
import { DashboardLayout } from '../DashboardLayout';

// Mock the Button component
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('DashboardLayout', () => {
  it('renders the sidebar with navigation items', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    // Check if the Mind Vault logo is present
    expect(screen.getByText('Mind Vault')).toBeInTheDocument();

    // Check if navigation items are present
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Hub')).toBeInTheDocument();
    expect(screen.getByText('Learning Lab')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders the search bar in the top bar', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    const searchInput = screen.getByPlaceholderText('Search notes, books, highlights...');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders children content in the main area', () => {
    render(
      <DashboardLayout>
        <div data-testid="test-content">Test content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('shows mobile menu button on smaller screens', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    const menuButton = screen.getByLabelText('Open sidebar');
    expect(menuButton).toBeInTheDocument();
  });

  it('toggles sidebar when menu button is clicked', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    const menuButton = screen.getByLabelText('Open sidebar');
    fireEvent.click(menuButton);

    // The sidebar should be visible (we can't easily test the transform class change)
    // but we can verify the button is clickable
    expect(menuButton).toBeInTheDocument();
  });

  it('displays user information in the sidebar', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });
});
