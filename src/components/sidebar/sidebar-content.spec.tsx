import userEvent from '@testing-library/user-event';

import { SidebarContent } from '@/components/sidebar/sidebar-content';
import { render, screen } from '@/lib/test-utils';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('SidebarContent', () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it('navigates to home when clicking Novo prompt', async () => {
    render(<SidebarContent />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /novo prompt/i }));

    expect(pushMock).toHaveBeenCalledWith('/');
  });
});
