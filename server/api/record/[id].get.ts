import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID записи не указан",
      });
    }

    const record = await prisma.record.findUnique({
      where: {
        id,
      },
      include: {
        staffInShift: true,
        tableData: true,
      },
    });

    if (!record) {
      throw createError({
        statusCode: 404,
        statusMessage: "Запись не найдена",
      });
    }

    return record;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage:
        error instanceof Error
          ? error.message
          : "Ошибка при получении записи по айди",
    });
  }
});
