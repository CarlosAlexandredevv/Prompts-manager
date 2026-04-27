import userEvent from '@testing-library/user-event';

import { PromptManager } from '@/components/prompts/prompt-manager';
import { render, screen } from '@/lib/test-utils';

const createPromptMock = jest.fn();
const updatePromptMock = jest.fn();
const deletePromptMock = jest.fn();
const refreshMock = jest.fn();

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

const createDeferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });

  return { promise, resolve };
};

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
    expect(screen.getByText('Novo')).toBeInTheDocument();
    expect(screen.getByText('Conteudo novo')).toBeInTheDocument();
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it('syncs created prompt from updated initialPrompts after refresh', async () => {
    createPromptMock.mockResolvedValue({ ok: true });
    const { rerender } = render(<PromptManager initialPrompts={[]} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/titulo/i), 'Novo');
    await user.type(screen.getByLabelText(/conteudo/i), 'Conteudo novo');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    rerender(
      <PromptManager
        initialPrompts={[{ id: 'real-1', title: 'Novo', content: 'Conteudo novo' }]}
      />,
    );

    expect(screen.getByText('Novo')).toBeInTheDocument();
    expect(screen.getByText('Conteudo novo')).toBeInTheDocument();
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
    expect(screen.getByText('Prompt atualizado')).toBeInTheDocument();
    expect(screen.getByText('Conteudo atualizado')).toBeInTheDocument();
    expect(refreshMock).toHaveBeenCalledTimes(1);
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
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it('shows action error message', async () => {
    createPromptMock.mockResolvedValue({ ok: false, error: 'Falhou ao criar' });
    render(<PromptManager initialPrompts={[]} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/titulo/i), 'Novo');
    await user.type(screen.getByLabelText(/conteudo/i), 'Conteudo novo');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Falhou ao criar');
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('prevents double submit while request is pending', async () => {
    const deferred = createDeferred<{ ok: true }>();
    createPromptMock.mockReturnValue(deferred.promise);

    render(<PromptManager initialPrompts={[]} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/titulo/i), 'Novo');
    await user.type(screen.getByLabelText(/conteudo/i), 'Conteudo novo');

    const submitButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(submitButton);
    await user.click(submitButton);

    expect(createPromptMock).toHaveBeenCalledTimes(1);
    expect(submitButton).toBeDisabled();

    deferred.resolve({ ok: true });
    expect(await screen.findByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });

  it('prevents double delete for same item while request is pending', async () => {
    const deferred = createDeferred<{ ok: true }>();
    deletePromptMock.mockReturnValue(deferred.promise);

    render(
      <PromptManager
        initialPrompts={[{ id: '1', title: 'Prompt', content: 'Conteudo' }]}
      />,
    );
    const user = userEvent.setup();

    const deleteButton = screen.getByRole('button', { name: /excluir/i });
    await user.click(deleteButton);
    await user.click(deleteButton);

    expect(deletePromptMock).toHaveBeenCalledTimes(1);
    expect(deleteButton).toBeDisabled();

    deferred.resolve({ ok: true });
    expect(await screen.findByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });
});
