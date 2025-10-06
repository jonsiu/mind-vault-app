import { render, screen, fireEvent } from '@/test-utils/test-utils';
import { LearningLabView } from '../LearningLabView';

// Mock the Button component
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('LearningLabView', () => {
  it('renders the learning lab header with title and description', () => {
    render(<LearningLabView />);

    expect(screen.getByText('Learning Lab')).toBeInTheDocument();
    expect(screen.getByText('AI-powered learning exercises and spaced repetition')).toBeInTheDocument();
  });

  it('renders the Generate Exercises button', () => {
    render(<LearningLabView />);

    const generateButton = screen.getByText('Generate Exercises');
    expect(generateButton).toBeInTheDocument();
  });

  it('renders the tab navigation', () => {
    render(<LearningLabView />);

    expect(screen.getByText('Exercises')).toBeInTheDocument();
    expect(screen.getByText('Spaced Repetition')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('shows exercises tab by default', () => {
    render(<LearningLabView />);

    expect(screen.getByText('No exercises yet')).toBeInTheDocument();
    expect(screen.getByText('Generate personalized learning exercises based on your notes and highlights.')).toBeInTheDocument();
  });

  it('calls handleGenerateExercises when Generate Exercises button is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<LearningLabView />);
    
    const generateButton = screen.getByText('Generate Exercises');
    fireEvent.click(generateButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Generate exercises clicked');
    
    consoleSpy.mockRestore();
  });

  it('switches to spaced repetition tab when clicked', () => {
    render(<LearningLabView />);

    const spacedRepetitionTab = screen.getByText('Spaced Repetition');
    fireEvent.click(spacedRepetitionTab);

    expect(screen.getByText('No items for review')).toBeInTheDocument();
    expect(screen.getByText('Create highlights and notes to start your spaced repetition journey.')).toBeInTheDocument();
  });

  it('switches to analytics tab when clicked', () => {
    render(<LearningLabView />);

    const analyticsTab = screen.getByText('Analytics');
    fireEvent.click(analyticsTab);

    expect(screen.getByText('Books Read')).toBeInTheDocument();
    expect(screen.getByText('Notes Created')).toBeInTheDocument();
    expect(screen.getByText('Exercises Completed')).toBeInTheDocument();
    expect(screen.getByText('Learning Time')).toBeInTheDocument();
  });

  it('renders analytics cards with correct metrics', () => {
    render(<LearningLabView />);

    // Switch to analytics tab
    const analyticsTab = screen.getByText('Analytics');
    fireEvent.click(analyticsTab);

    // Check for metric values (should be 0 for empty state)
    const metricValues = screen.getAllByText('0');
    expect(metricValues).toHaveLength(4);
  });

  it('shows empty state for exercises tab', () => {
    render(<LearningLabView />);

    expect(screen.getByText('No exercises yet')).toBeInTheDocument();
    expect(screen.getByText('Generate Your First Exercises')).toBeInTheDocument();
  });

  it('shows empty state for spaced repetition tab', () => {
    render(<LearningLabView />);

    const spacedRepetitionTab = screen.getByText('Spaced Repetition');
    fireEvent.click(spacedRepetitionTab);

    expect(screen.getByText('No items for review')).toBeInTheDocument();
    expect(screen.getByText('Create highlights and notes to start your spaced repetition journey.')).toBeInTheDocument();
  });
});
