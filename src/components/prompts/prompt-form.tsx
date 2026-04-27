type PromptFormProps = {
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  error: string | null;
};

export function PromptForm({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSubmit,
  submitLabel,
  error,
}: PromptFormProps) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="prompt-title">Titulo</label>
        <input
          id="prompt-title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="prompt-content">Conteudo</label>
        <textarea
          id="prompt-content"
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
        />
      </div>

      {error ? <p role="alert">{error}</p> : null}

      <button type="button" onClick={onSubmit}>
        {submitLabel}
      </button>
    </section>
  );
}
