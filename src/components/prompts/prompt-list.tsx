type PromptItem = {
  id: string;
  title: string;
  content: string;
};

type PromptListProps = {
  prompts: PromptItem[];
  onEdit: (item: PromptItem) => void;
  onDelete: (id: string) => void;
};

export function PromptList({ prompts, onEdit, onDelete }: PromptListProps) {
  return (
    <section>
      <ul className="space-y-3">
        {prompts.map((prompt) => (
          <li key={prompt.id} className="space-y-2">
            <h2>{prompt.title}</h2>
            <p>{prompt.content}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => onEdit(prompt)}>
                Editar
              </button>
              <button type="button" onClick={() => onDelete(prompt.id)}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
