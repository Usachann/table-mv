import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const date = getRouterParam(event, "date");

    if (!date) {
      throw createError({
        statusCode: 400,
        statusMessage: "Дата не указана",
      });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await prisma.record.findMany({
      where: {
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        staffInShift: true,
        tableData: true,
      },
      orderBy: {
        dateTime: "desc",
      },
    });

    if (!records) {
      throw createError({
        statusCode: 404,
        statusMessage: "Записи не найдены",
      });
    }

    return records;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage:
        error instanceof Error ? error.message : "Ошибка при получении записей",
    });
  }
});
