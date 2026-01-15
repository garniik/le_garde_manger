import { reactive } from "vue";

export const authStore = reactive({
    isAuthenticated: localStorage.getItem("user_logged") === "true",
    login() {
        this.isAuthenticated = true;
        localStorage.setItem("user_logged", "true");
    },
    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem("user_logged");
    },
});
