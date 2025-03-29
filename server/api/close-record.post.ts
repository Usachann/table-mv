import { sendDayReportEmail } from "../../utils/email";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { record } = body;

    const emailResult = await sendDayReportEmail({
      hospitalName: record.hospitalName,
      date: new Date(record.dateTime).toLocaleDateString(),
      shootsCount: record.shootsCount,
      hospitalDischargesCount: record.hospitalDischargesCount,
      staffInShift: record.staffInShift,
      recycling: record.recycling,
      delayed: record.delayed,
      tableData: record.tableData,
    });

    if (!emailResult.success) {
      throw createError({
        statusCode: 500,
        statusMessage: "Ошибка при отправке email",
      });
    }

    return {
      success: true,
      message: "День успешно закрыт и отчет отправлен",
    };
  } catch (error) {
    console.error("Error closing day:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при закрытии дня",
    });
  }
});
