export type PromptCreateInput = {
  title: string;
  content: string;
};

export type PromptUpdateInput = PromptCreateInput & {
  id: string;
};

export type PromptDeleteInput = {
  id: string;
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: string };

const isBlank = (value: string | undefined | null): boolean => {
  return !value || value.trim().length === 0;
};

export const validateCreatePromptInput = (
  input: PromptCreateInput,
): ValidationResult => {
  if (isBlank(input.title)) {
    return { ok: false, error: 'Title obrigatório' };
  }

  if (isBlank(input.content)) {
    return { ok: false, error: 'Content obrigatório' };
  }

  return { ok: true };
};

export const validateUpdatePromptInput = (
  input: PromptUpdateInput,
): ValidationResult => {
  if (isBlank(input.id)) {
    return { ok: false, error: 'Prompt id obrigatório' };
  }

  return validateCreatePromptInput(input);
};

export const validateDeletePromptInput = (
  input: PromptDeleteInput,
): ValidationResult => {
  if (isBlank(input.id)) {
    return { ok: false, error: 'Prompt id obrigatório' };
  }

  return { ok: true };
};
