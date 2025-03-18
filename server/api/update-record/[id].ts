import prisma from "~~/lib/prisma";
import type { Record } from "../../../typings/record";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: "ID записи не указан",
      });
    }

    const body = await readBody<Record>(event);

    // Обновляем запись со всеми данными
    const updatedRecord = await prisma.record.update({
      where: { id },
      data: {
        hospitalName: body.hospitalName,
        dateTime: new Date(body.dateTime),
        workTimeEnd: body.workTimeEnd,
        recordStatus: body.recordStatus,
        shootsCount: body.shootsCount,
        hospitalDischargesCount: body.hospitalDischargesCount,
        staffInShift: body.staffInShift.map((staff) => ({
          recordId: id,
          staffName: staff.staffName,
          staff: staff.staff,
          staffTransportCost: staff.staffTransportCost,
          inShift: staff.inShift,
        })),
        tableData: body.tableData.map((row) => ({
          recordId: id,
          floor: row.floor,
          nurseName: row.nurseName,
          surname: row.surname,
          motherPhone: row.motherPhone,
          motherName: row.motherName,
          fatherPhone: row.fatherPhone,
          fatherName: row.fatherName,
          gender: row.gender,
          childNumber: row.childNumber,
          time: new Date(row.time),
          notes: row.notes,
          tableRecordStatus: row.tableRecordStatus,
          OPN: row.OPN,
        })),
      },
    });

    return updatedRecord;
  } catch (error) {
    console.error("Ошибка при обновлении записи:", error);
    throw createError({
      statusCode: 500,
      message: "Ошибка при обновлении записи",
    });
  }
});
