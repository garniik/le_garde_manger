import { reactive } from "vue";

export const authStore = reactive({
    isAuthenticated: localStorage.getItem("user_logged") === "true",
    email: localStorage.getItem("user_email") || "",
    password: localStorage.getItem("user_password") || "",
    login(email, password) {
        this.isAuthenticated = true;
        this.email = email;
        this.password = password;
        localStorage.setItem("user_logged", "true");
        localStorage.setItem("user_email", email);
        localStorage.setItem("user_password", password);
    },
    logout() {
        this.isAuthenticated = false;
        this.email = "";
        this.password = "";
        localStorage.removeItem("user_logged");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_password");
    },
});
