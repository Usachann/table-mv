import nodemailer from "nodemailer";

interface EmailData {
  hospitalName: string;
  date: string;
  shootsCount: number;
  hospitalDischargesCount: number;
  staffInShift: Array<{
    staff: string;
    staffTransportCost: number;
  }>;
  recycling: string;
  delayed: string;
  tableData: Array<{
    floor: string;
    nurseName: string;
    surname: string;
    motherPhone: string;
    motherName: string;
    fatherPhone: string;
    fatherName: string;
    gender: string;
    childNumber: number;
    time: Date;
    notes: string;
    tableRecordStatus: string;
    OPN: boolean;
  }>;
}

export async function sendDayReportEmail(data: EmailData) {
  const transporter = nodemailer.createTransport({
    pool: true,
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const staffList = data.staffInShift
    .map((staff) => `${staff.staff}: ${staff.staffTransportCost}₽`)
    .join("\n");

  const tableRows = data.tableData
    .map(
      (row, index) => `
  <tr>
    <td>${index + 1}</td>
    <td>${row.floor}</td>
    <td>${row.tableRecordStatus}</td>
    <td>${row.nurseName}</td>
    <td>${row.surname}</td>
    <td>${row.motherPhone}<br>${row.motherName}</td>
    <td>${row.fatherPhone}<br>${row.fatherName}</td>
    <td>${row.gender}</td>
    <td>${row.childNumber}</td>
    <td>${new Date(row.time).toLocaleTimeString()}</td>
    <td>${row.notes}</td>
    <td>${row.OPN ? "Да" : "Нет"}</td>
  </tr>
`
    )
    .join("");

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: process.env.NOTIFICATION_EMAIL,
    subject: `Отчет за день - ${data.hospitalName} (${data.date})`,
    html: `
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 14px;
      }
      th, td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f5f5f5;
      }
      .info-section {
        margin-bottom: 20px;
      }
      .info-section h3 {
        margin: 0 0 10px 0;
        color: #333;
      }
      .staff-section {
        margin: 20px 0;
      }
      .staff-section pre {
        background-color: #f5f5f5;
        padding: 10px;
        border-radius: 4px;
      }
    </style>

    <div class="info-section">
      <h3>Информация о смене</h3>
      <p><strong>Роддом:</strong> ${data.hospitalName}</p>
      <p><strong>Дата:</strong> ${data.date}</p>
      <p><strong>Количество съемок:</strong> ${data.shootsCount}</p>
      <p><strong>Количество выписок:</strong> ${data.hospitalDischargesCount}</p>
    </div>

    <div class="staff-section">
      <h3>Персонал</h3>
      <pre>${staffList}</pre>
    </div>

    <div class="info-section">
      <h3>Дополнительная информация</h3>
      <p><strong>Переработка:</strong> ${data.recycling}</p>
      <p><strong>Опоздавшие:</strong> ${data.delayed}</p>
    </div>

    <h3>Таблица выписок</h3>
    <table>
      <thead>
        <tr>
          <th>№</th>
          <th>Этаж</th>
          <th>Снимались</th>
          <th>Медсестра</th>
          <th>Фамилия</th>
          <th>Телефон и имя мамы</th>
          <th>Телефон и имя папы</th>
          <th>Пол</th>
          <th>Какой ребенок</th>
          <th>Время</th>
          <th>Пометки</th>
          <th>ОПН</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
