import { render, screen, fireEvent } from '@/test-utils/test-utils';
import { LibraryView } from '../LibraryView';

describe('LibraryView', () => {
  it('renders the library header with title and description', () => {
    render(<LibraryView />);

    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Your personal ebook collection')).toBeInTheDocument();
  });

  it('renders the Add Book button', () => {
    render(<LibraryView />);

    const addBookButton = screen.getByText('Add Book');
    expect(addBookButton).toBeInTheDocument();
  });

  it('shows empty state when no books are present', () => {
    render(<LibraryView />);

    expect(screen.getByText('No books yet')).toBeInTheDocument();
    expect(screen.getByText('Upload your first ebook to get started with your personal library.')).toBeInTheDocument();
    expect(screen.getByText('Add Your First Book')).toBeInTheDocument();
  });

  it('renders view mode toggle buttons', () => {
    render(<LibraryView />);

    // Check for grid and list view buttons (they should be present as SVG icons)
    const viewButtons = screen.getAllByRole('button');
    const viewModeButtons = viewButtons.filter(button => 
      button.getAttribute('class')?.includes('rounded-md') && 
      button.querySelector('svg')
    );
    expect(viewModeButtons).toHaveLength(2);
  });

  it('renders sort dropdown', () => {
    render(<LibraryView />);

    const sortSelect = screen.getByDisplayValue('Title');
    expect(sortSelect).toBeInTheDocument();
  });

  it('calls handleUploadBook when Add Book button is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<LibraryView />);
    
    const addBookButton = screen.getByText('Add Book');
    fireEvent.click(addBookButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Upload book clicked');
    
    consoleSpy.mockRestore();
  });

  it('changes sort option when dropdown is changed', () => {
    render(<LibraryView />);

    const sortSelect = screen.getByDisplayValue('Title');
    fireEvent.change(sortSelect, { target: { value: 'author' } });

    expect(sortSelect).toHaveValue('author');
  });

  it('toggles view mode when view buttons are clicked', () => {
    render(<LibraryView />);

    // Get the list view button (second button with rounded-md class)
    const viewButtons = screen.getAllByRole('button');
    const listViewButton = viewButtons.find(button => 
      button.getAttribute('class')?.includes('rounded-md') && 
      button.getAttribute('class')?.includes('hover:text-slate-600')
    );
    
    if (listViewButton) {
      fireEvent.click(listViewButton);
      // The button should now have the active state
      expect(listViewButton.getAttribute('class')).toContain('bg-blue-100');
    }
  });
});
