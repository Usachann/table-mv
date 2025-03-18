{
  record: {
    dateOfRecording: "Date"; //дата созданеия записи, уникальное
    workTimeStart: "Number"; //время начала
    workTimeEnd: "Number";
    hospitalName: "String"; //название клиники
    staffInShift: [
      {
        staffName: "String", //имя
        staff: "String", //фотографф
        staffTransportCost: "Number", //транспортный расход фотографа
        inShift: "Boleant",
      },
    ];

    hospitalStatus: "String"; //снимались/не снимались
    recordStatus: "String"; //открыто/закрыто
    tableData: [
      {
        id: "String",
        floor: "String",
        surname: "String",
        motherPhone: "String",
        motherName: "String",
        fatherPhone: "String",
        fatherName: "String",
        gender: "String",
        childNumber: "Number",
        time: "Time",
        notes: "Strung",
      },
      {
        id: "String",
        floor: "String",
        surname: "String",
        motherPhone: "String",
        motherName: "String",
        fatherPhone: "String",
        fatherName: "String",
        gender: "String",
        childNumber: "Number",
        time: "Time",
        notes: "Strung",
      },
    ];
    //записей может быть несколько

    shootsСount: "Number";
    hospitalDischargesCount: "Number";
  }
}
