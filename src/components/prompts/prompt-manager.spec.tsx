import userEvent from '@testing-library/user-event';

import { PromptManager } from '@/components/prompts/prompt-manager';
import { render, screen } from '@/lib/test-utils';

const createPromptMock = jest.fn();
const updatePromptMock = jest.fn();
const deletePromptMock = jest.fn();
const refreshMock = jest.fn();

jest.mock('@/app/actions/prompt-actions', () => ({
  createPrompt: (...args: unknown[]) => createPromptMock(...args),
  updatePrompt: (...args: unknown[]) => updatePromptMock(...args),
  deletePrompt: (...args: unknown[]) => deletePromptMock(...args),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

describe('PromptManager', () => {
  beforeEach(() => {
    createPromptMock.mockReset();
    updatePromptMock.mockReset();
    deletePromptMock.mockReset();
    refreshMock.mockReset();
  });

  it('creates a prompt from form input', async () => {
    createPromptMock.mockResolvedValue({ ok: true });
    render(<PromptManager initialPrompts={[]} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/titulo/i), 'Novo');
    await user.type(screen.getByLabelText(/conteudo/i), 'Conteudo novo');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(createPromptMock).toHaveBeenCalledWith({
      title: 'Novo',
      content: 'Conteudo novo',
    });
  });

  it('updates prompt when editing an existing item', async () => {
    updatePromptMock.mockResolvedValue({ ok: true });
    render(
      <PromptManager
        initialPrompts={[
          { id: '1', title: 'Prompt antigo', content: 'Conteudo antigo' },
        ]}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /editar/i }));
    await user.clear(screen.getByLabelText(/titulo/i));
    await user.type(screen.getByLabelText(/titulo/i), 'Prompt atualizado');
    await user.clear(screen.getByLabelText(/conteudo/i));
    await user.type(screen.getByLabelText(/conteudo/i), 'Conteudo atualizado');
    await user.click(screen.getByRole('button', { name: /atualizar/i }));

    expect(updatePromptMock).toHaveBeenCalledWith({
      id: '1',
      title: 'Prompt atualizado',
      content: 'Conteudo atualizado',
    });
  });

  it('deletes prompt from list', async () => {
    deletePromptMock.mockResolvedValue({ ok: true });
    render(
      <PromptManager
        initialPrompts={[{ id: '1', title: 'Prompt', content: 'Conteudo' }]}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /excluir/i }));

    expect(deletePromptMock).toHaveBeenCalledWith({ id: '1' });
    expect(screen.queryByText('Prompt')).not.toBeInTheDocument();
  });

  it('shows action error message', async () => {
    createPromptMock.mockResolvedValue({ ok: false, error: 'Falhou ao criar' });
    render(<PromptManager initialPrompts={[]} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/titulo/i), 'Novo');
    await user.type(screen.getByLabelText(/conteudo/i), 'Conteudo novo');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Falhou ao criar');
  });
});
