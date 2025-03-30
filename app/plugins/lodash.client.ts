import { debounce, throttle } from "lodash-es";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide("debounce", debounce);
  nuxtApp.provide("throttle", throttle);
});
