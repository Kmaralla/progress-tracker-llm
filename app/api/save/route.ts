import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { data } = await req.json();
  const today = new Date();

  await prisma.$transaction(
    data.map((item: { task: string; progress: number }) =>
      prisma.progress.create({
        data: { task: item.task, progress: item.progress, date: today },
      })
    )
  );

  return Response.json({ success: true });
}
