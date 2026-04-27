type PromptItem = {
  id: string;
  title: string;
  content: string;
};

type PromptListProps = {
  prompts: PromptItem[];
  onEdit: (item: PromptItem) => void;
  onDelete: (id: string) => void;
  isSubmitPending: boolean;
  deletingIds: string[];
};

export function PromptList({
  prompts,
  onEdit,
  onDelete,
  isSubmitPending,
  deletingIds,
}: PromptListProps) {
  return (
    <section>
      <ul className="space-y-3">
        {prompts.map((prompt) => (
          <li key={prompt.id} className="space-y-2">
            <h2>{prompt.title}</h2>
            <p>{prompt.content}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(prompt)}
                disabled={isSubmitPending || deletingIds.includes(prompt.id)}
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(prompt.id)}
                disabled={isSubmitPending || deletingIds.includes(prompt.id)}
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
