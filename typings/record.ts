export const RECORD_STATUS = {
  OPEN: "открыто",
  CLOSED: "закрыто",
} as const;

export const GENDER = {
  MALE: "М",
  FEMALE: "Ж",
  TWINS: "ДВ",
} as const;

export const TABLE_RECORD_STATUS = {
  SHOT: "Снимались",
  NOT_SHOT: "Не снимались",
} as const;

export type RecordStatus = (typeof RECORD_STATUS)[keyof typeof RECORD_STATUS];

export type Gender = (typeof GENDER)[keyof typeof GENDER];

export type TableRecordStatus =
  (typeof TABLE_RECORD_STATUS)[keyof typeof TABLE_RECORD_STATUS];

export type Record = {
  id: string; // Уникальный ID записи
  dateTime: Date; // Дата создания записи
  workTimeEnd: number; // Время окончания работы
  hospitalName: string; // Название клиники
  recordStatus: RecordStatus; // Статус записи
  shootsCount: number; // Количество съемок
  hospitalDischargesCount: number; // Количество выписок
  staffInShift: StaffInShift[]; // Сотрудники в смене
  tableData: TableData[]; // Данные по пациентам
  recycling?: Date; // Переработка
  delayed?: string; // Опоздавшие
};

export type StaffInShift = {
  recordId: string; // ID записи, к которой относится
  staffName: string; // Имя сотрудника
  staff: string; // Фотограф
  staffTransportCost: number; // Транспортный расход фотографа
  inShift: boolean; // Был ли в смене
};

export type TableData = {
  recordId: string; // ID записи, к которой относится
  floor: number; // Этаж
  nurseName: string; // Имя медсестры
  surname: string; // Фамилия
  motherPhone?: string; // Телефон матери
  motherName?: string; // Имя матери
  fatherPhone?: string; // Телефон отца
  fatherName?: string; // Имя отца
  gender: string; // Пол
  childNumber: number; // Номер ребенка (по счету)
  time: Date; // Время
  notes?: string; // Заметки (опционально)
  tableRecordStatus: TableRecordStatus; // Статус записи
  OPN: boolean; // ОПН
  isSpecialCase: boolean; // Малоимущие/иностранцы
};

export type Hospital = {
  id: number;
  name: string;
};
