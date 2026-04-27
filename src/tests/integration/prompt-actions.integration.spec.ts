import { prisma } from '@/lib/prisma';
import {
  createPrompt,
  deletePrompt,
  updatePrompt,
} from '@/app/actions/prompt-actions';

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

if (typeof globalThis.setImmediate === 'undefined') {
  globalThis.setImmediate = ((callback: (...args: unknown[]) => void, ...args: unknown[]) =>
    setTimeout(callback, 0, ...args)) as unknown as typeof setImmediate;
}

describe('prompt-actions integration', () => {
  beforeEach(async () => {
    await prisma.prompt.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('create persiste no banco', async () => {
    const result = await createPrompt({
      title: 'Prompt de create',
      content: 'Conteudo inicial',
    });

    expect(result).toEqual({ ok: true });

    const saved = await prisma.prompt.findUnique({
      where: { title: 'Prompt de create' },
    });

    expect(saved).toBeTruthy();
    expect(saved?.content).toBe('Conteudo inicial');
  });

  it('update altera registro existente', async () => {
    const created = await prisma.prompt.create({
      data: {
        title: 'Prompt original',
        content: 'Conteudo original',
      },
    });

    const result = await updatePrompt({
      id: created.id,
      title: 'Prompt atualizado',
      content: 'Conteudo atualizado',
    });

    expect(result).toEqual({ ok: true });

    const updated = await prisma.prompt.findUnique({
      where: { id: created.id },
    });

    expect(updated?.title).toBe('Prompt atualizado');
    expect(updated?.content).toBe('Conteudo atualizado');
  });

  it('delete remove registro', async () => {
    const created = await prisma.prompt.create({
      data: {
        title: 'Prompt para remover',
        content: 'Conteudo para remover',
      },
    });

    const result = await deletePrompt({ id: created.id });

    expect(result).toEqual({ ok: true });

    const deleted = await prisma.prompt.findUnique({
      where: { id: created.id },
    });

    expect(deleted).toBeNull();
  });

  it('create com payload invalido retorna erro esperado', async () => {
    const result = await createPrompt({
      title: '',
      content: '',
    });

    expect(result).toEqual({ ok: false, error: 'Title obrigatório' });
  });

  it('create com content vazio retorna erro de content obrigatório', async () => {
    const result = await createPrompt({
      title: 'Titulo valido',
      content: '',
    });

    expect(result).toEqual({ ok: false, error: 'Content obrigatório' });
  });

  it('update com id inexistente retorna Prompt not found', async () => {
    const result = await updatePrompt({
      id: 'prompt-inexistente',
      title: 'Titulo',
      content: 'Conteudo',
    });

    expect(result).toEqual({ ok: false, error: 'Prompt not found' });
  });
});
