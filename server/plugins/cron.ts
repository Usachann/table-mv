import cron from "node-cron";
import prisma from "~~/lib/prisma";
import { RECORD_STATUS } from "../../typings/record";

export default defineNitroPlugin(() => {
  cron.schedule("59 23 * * *", async () => {
    console.log("Запуск CRON-задачи для отправки email...");
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const records = await prisma.record.findMany({
      where: {
        recordStatus: RECORD_STATUS.OPEN,
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

    if (records.length === 0) {
      return;
    }

    for (const record of records) {
      try {
        await $fetch("/api/close-record", {
          method: "POST",
          body: { record: record },
        });

        await prisma.record.update({
          where: { id: record.id },
          data: { recordStatus: RECORD_STATUS.CLOSED },
        });
      } catch (error) {
        console.error(`Ошибка при обработке записи ${record.id}:`, error);
      }
    }
  });

  console.log("CRON-задача запущена: отправка email в 23:59.");
});
