import { render, screen } from '../utils/test-utils';
import SimpleTest from './SimpleTest';

describe('SimpleTest', () => {
  it('should render without crashing', () => {
    render(<SimpleTest />);
    expect(screen.getByTestId('simple-test')).toBeInTheDocument();
    expect(screen.getByText('Simple Test Component')).toBeInTheDocument();
  });
}); 