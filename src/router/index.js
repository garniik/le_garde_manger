import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/Login.vue"; // Vérifie bien le chemin vers ton Login.vue
import { authStore } from "@/stores/auth"; // On importe l'état de connexion

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/login",
            name: "login",
            component: LoginView,
        },
        {
            path: "/",
            name: "home",
            component: HomeView,
            meta: { requiresAuth: true }, // Ajout du verrou
        },
        {
            path: "/about",
            name: "about",
            component: () => import("../views/AboutView.vue"),
            meta: { requiresAuth: true }, // Ajout du verrou
        },
    ],
});

// La garde de navigation : elle s'exécute avant chaque changement de page
router.beforeEach((to, from, next) => {
    const isLogged = authStore.isAuthenticated;

    // Si la route demande une authentification et que l'utilisateur n'est pas loggé
    if (to.meta.requiresAuth && !isLogged) {
        next({ name: "login" });
    }
    // Si l'utilisateur est déjà loggé et essaie d'aller sur le Login
    else if (to.name === "login" && isLogged) {
        next({ name: "home" });
    } else {
        next(); // Laisse passer
    }
});

export default router;
