import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        message: "ID записи не указан",
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
        message: "Запись не найдена",
      });
    }

    return record;
  } catch (error) {
    throw createError({
      statusCode: 500,
      message:
        error instanceof Error
          ? error.message
          : "Ошибка при получении записи по айди",
    });
  }
});
