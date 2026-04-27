'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  createPrompt,
  deletePrompt,
  updatePrompt,
} from '@/app/actions/prompt-actions';

import { PromptForm } from './prompt-form';
import { PromptList } from './prompt-list';

type PromptItem = {
  id: string;
  title: string;
  content: string;
};

type PromptManagerProps = {
  initialPrompts: PromptItem[];
};

export function PromptManager({ initialPrompts }: PromptManagerProps) {
  const router = useRouter();
  const [prompts, setPrompts] = useState(initialPrompts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const result = editingId
      ? await updatePrompt({ id: editingId, title, content })
      : await createPrompt({ title, content });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError(null);
    setTitle('');
    setContent('');
    setEditingId(null);
    router.refresh();
  };

  const handleEdit = (item: PromptItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    const result = await deletePrompt({ id });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError(null);
    setPrompts((previous) => previous.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setTitle('');
      setContent('');
    }
    router.refresh();
  };

  return (
    <section className="space-y-6 p-6">
      <PromptForm
        title={title}
        content={content}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onSubmit={handleSubmit}
        submitLabel={editingId ? 'Atualizar' : 'Salvar'}
        error={error}
      />
      <PromptList prompts={prompts} onEdit={handleEdit} onDelete={handleDelete} />
    </section>
  );
}
