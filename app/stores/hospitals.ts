import { defineStore } from "pinia";
import type { Hospital } from "../../typings/record";

export const useHospitalStore = defineStore("hospitalStore", {
  state: () => ({
    hospitals: [
      { id: 1, name: "4 Роддом" },
      { id: 2, name: "7 Роддом" },
      { id: 3, name: "Видное" },
      { id: 4, name: "Мытищи" },
      { id: 5, name: "Щелково" },
      { id: 6, name: "Подольск" },
      { id: 7, name: "Одинцово" },
      { id: 8, name: "Раменское" },
    ] as Hospital[],
  }),

  getters: {
    allHospitals: (state) => state.hospitals,
    getHospitalById: (state) => (id: number) =>
      state.hospitals.find((hospital) => hospital.id === id),
  },

  actions: {},
});

// TODO: Добавить метод для получения списка роддомов из API
