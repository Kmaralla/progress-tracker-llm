import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { days } = await req.json();
  const from = new Date();
  from.setDate(from.getDate() - days);

  const results = await prisma.progress.findMany({
    where: { date: { gte: from } },
  });

  const grouped = results.reduce((acc: any, r) => {
    acc[r.task] = acc[r.task] || [];
    acc[r.task].push(r.progress);
    return acc;
  }, {});

  const summary = Object.entries(grouped).map(([task, values]: any) => ({
    task,
    average: (values.reduce((a: number, b: number) => a + b, 0) / values.length).toFixed(1),
  }));

  return Response.json(summary);
}
