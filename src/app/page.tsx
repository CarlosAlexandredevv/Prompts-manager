import { PromptManager } from '@/components/prompts/prompt-manager';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const prompts = await prisma.prompt.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <section className="flex min-h-full">
      <div className="flex flex-1">
        <PromptManager
          initialPrompts={prompts.map((prompt) => ({
            id: prompt.id,
            title: prompt.title,
            content: prompt.content,
          }))}
        />
      </div>
    </section>
  );
}