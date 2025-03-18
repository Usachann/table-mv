import prisma from "~~/lib/prisma";
import type { StaffInShift, Record } from "~~/typings/record";

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "POST") {
    throw createError({ statusCode: 405, message: "Method Not Allowed" });
  }

  try {
    const body: Record = await readBody(event);
    const { staffInShift, tableData, ...recordData } = body;

    const record = await prisma.record.create({
      data: {
        ...recordData,
        staffInShift: staffInShift.map((staff: StaffInShift) => ({
          recordId: staff.recordId,
          staffName: staff.staffName || "",
          staff: staff.staff,
          staffTransportCost: staff.staffTransportCost,
          inShift: staff.inShift,
        })),
      },
      include: {
        staffInShift: true,
        tableData: true,
      },
    });

    return { id: record.id };
  } catch (error) {
    console.error("Ошибка при создании записи:", error);
    throw createError({
      statusCode: 500,
      message:
        error instanceof Error ? error.message : "Ошибка при создании записи",
    });
  }
});
