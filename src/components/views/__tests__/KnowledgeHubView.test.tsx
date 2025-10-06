import { render, screen, fireEvent } from '@/test-utils/test-utils';
import { KnowledgeHubView } from '../KnowledgeHubView';

// Mock the Button component
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('KnowledgeHubView', () => {
  it('renders the notes sidebar with search and filters', () => {
    render(<KnowledgeHubView />);

    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('New Note')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search notes...')).toBeInTheDocument();
  });

  it('shows empty state when no notes are present', () => {
    render(<KnowledgeHubView />);

    expect(screen.getByText('No notes yet')).toBeInTheDocument();
  });

  it('renders type filter dropdown', () => {
    render(<KnowledgeHubView />);

    const typeSelect = screen.getByDisplayValue('All Types');
    expect(typeSelect).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
  });

  it('calls handleCreateNote when New Note button is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<KnowledgeHubView />);
    
    const newNoteButton = screen.getByText('New Note');
    fireEvent.click(newNoteButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Create note clicked');
    
    consoleSpy.mockRestore();
  });

  it('updates search query when typing in search input', () => {
    render(<KnowledgeHubView />);

    const searchInput = screen.getByPlaceholderText('Search notes...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(searchInput).toHaveValue('test query');
  });

  it('changes filter type when dropdown is changed', () => {
    render(<KnowledgeHubView />);

    const typeSelect = screen.getByDisplayValue('All Types');
    fireEvent.change(typeSelect, { target: { value: 'highlight' } });

    expect(typeSelect).toHaveValue('highlight');
  });

  it('shows main content area with placeholder when no note is selected', () => {
    render(<KnowledgeHubView />);

    expect(screen.getByText('Select a note to view')).toBeInTheDocument();
    expect(screen.getByText('Choose a note from the sidebar to view its content, or create a new note to get started.')).toBeInTheDocument();
  });

  it('renders the main content area with proper layout', () => {
    render(<KnowledgeHubView />);

    // Check if the main content area exists
    const mainContent = screen.getByText('Select a note to view').closest('div');
    expect(mainContent).toBeInTheDocument();
  });
});
