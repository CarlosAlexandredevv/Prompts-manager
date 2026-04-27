'use client';

import { useEffect, useState } from 'react';
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
  const [isSubmitPending, setIsSubmitPending] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  useEffect(() => {
    // Sync local state with fresh server data after router.refresh().
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrompts(initialPrompts);
  }, [initialPrompts]);

  const handleSubmit = async () => {
    if (isSubmitPending) {
      return;
    }

    const safeTitle = title.trim();
    const safeContent = content.trim();

    setIsSubmitPending(true);
    try {
      const result = editingId
        ? await updatePrompt({ id: editingId, title: safeTitle, content: safeContent })
        : await createPrompt({ title: safeTitle, content: safeContent });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (editingId) {
        setPrompts((previous) =>
          previous.map((item) =>
            item.id === editingId
              ? { ...item, title: safeTitle, content: safeContent }
              : item,
          ),
        );
      } else {
        setPrompts((previous) => [
          { id: crypto.randomUUID(), title: safeTitle, content: safeContent },
          ...previous,
        ]);
      }

      setError(null);
      setTitle('');
      setContent('');
      setEditingId(null);
      router.refresh();
    } finally {
      setIsSubmitPending(false);
    }
  };

  const handleEdit = (item: PromptItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (deletingIds.includes(id)) {
      return;
    }

    setDeletingIds((previous) => [...previous, id]);
    try {
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
    } finally {
      setDeletingIds((previous) => previous.filter((item) => item !== id));
    }
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
        isPending={isSubmitPending}
      />
      <PromptList
        prompts={prompts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isSubmitPending={isSubmitPending}
        deletingIds={deletingIds}
      />
    </section>
  );
}
