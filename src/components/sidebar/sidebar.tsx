import { SidebarContent } from './sidebar-content';
import { prisma } from '@/lib/prisma';

export async function Sidebar() {
  const prompts = await prisma.prompt.findMany();

  return <SidebarContent />;
}
