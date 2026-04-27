import { SidebarContent } from './sidebar-content';
import { prisma } from '@/lib/prisma';

export async function Sidebar() {
  await prisma.prompt.findMany();

  return <SidebarContent />;
}
