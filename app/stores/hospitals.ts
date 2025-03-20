import { defineStore } from "pinia";
import type { Hospital } from "../../typings/record";

export const useHospitalStore = defineStore("hospitalStore", {
  state: () => ({
    hospitals: [
      { id: 1, name: "Роддом №1" },
      { id: 2, name: "Роддом №2" },
      { id: 3, name: "Роддом №3" },
      { id: 4, name: "Роддом №4" },
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
