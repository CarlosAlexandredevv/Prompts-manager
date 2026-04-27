'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import {
  type PromptCreateInput,
  type PromptDeleteInput,
  type PromptUpdateInput,
  validateCreatePromptInput,
  validateDeletePromptInput,
  validateUpdatePromptInput,
} from '@/lib/validators/prompt';

type ActionResult = { ok: true } | { ok: false; error: string };

export const createPrompt = async (
  input: PromptCreateInput,
): Promise<ActionResult> => {
  const validation = validateCreatePromptInput(input);
  if (!validation.ok) {
    return validation;
  }

  await prisma.prompt.create({
    data: {
      title: input.title.trim(),
      content: input.content.trim(),
    },
  });

  revalidatePath('/');
  return { ok: true };
};

export const updatePrompt = async (
  input: PromptUpdateInput,
): Promise<ActionResult> => {
  const validation = validateUpdatePromptInput(input);
  if (!validation.ok) {
    return validation;
  }

  const existingPrompt = await prisma.prompt.findUnique({
    where: { id: input.id },
  });

  if (!existingPrompt) {
    return { ok: false, error: 'Prompt not found' };
  }

  await prisma.prompt.update({
    where: { id: input.id },
    data: {
      title: input.title.trim(),
      content: input.content.trim(),
    },
  });

  revalidatePath('/');
  return { ok: true };
};

export const deletePrompt = async (
  input: PromptDeleteInput,
): Promise<ActionResult> => {
  const validation = validateDeletePromptInput(input);
  if (!validation.ok) {
    return validation;
  }

  const existingPrompt = await prisma.prompt.findUnique({
    where: { id: input.id },
  });

  if (!existingPrompt) {
    return { ok: false, error: 'Prompt not found' };
  }

  await prisma.prompt.delete({
    where: { id: input.id },
  });

  revalidatePath('/');
  return { ok: true };
};
