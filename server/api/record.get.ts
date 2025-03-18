import prisma from "~~/lib/prisma";

export default defineEventHandler(async () => {
  try {
    const records = await prisma.record.findMany({
      include: {
        staffInShift: true,
        tableData: true,
      },
    });

    return records;
  } catch (error) {
    throw createError({ statusCode: 500 });
  }
});
