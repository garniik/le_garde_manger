<script setup>
import { RouterLink, RouterView, useRouter } from "vue-router";
import { authStore } from "@/stores/auth";

const router = useRouter();

// Fonction de déconnexion
const logout = () => {
    authStore.logout();
    router.push("/login");
};
</script>

<template>
    <header v-if="authStore.isAuthenticated">
        <img
            alt="Vue logo"
            class="logo"
            src="@/assets/logo.svg"
            width="125"
            height="125"
        />

        <div class="wrapper">
            <div class="brand">
                <h1>🥕 Mon Garde-Manger</h1>
            </div>

            <nav>
                <RouterLink to="/">Accueil</RouterLink>
                <RouterLink to="/about">À propos</RouterLink>
                <button @click="logout" class="logout-btn">Déconnexion</button>
            </nav>
        </div>
    </header>

    <main :class="{ 'auth-mode': !authStore.isAuthenticated }">
        <RouterView />
    </main>
</template>

<style>
/* Styles globaux pour supprimer les marges par défaut */
*,
*::before,
*::after {
    box-sizing: border-box;
}

body,
html {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

#app {
    width: 100%;
    margin: 0;
    padding: 0;
    max-width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

main {
    flex: 1;
    background-color: #f8fafc;
}
</style>

<style scoped>
header {
    line-height: 1.5;
    padding: 1.2rem 2rem;
    background: white;
    border-bottom: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

.logo {
    display: block;
    margin: 0 2rem 0 0;
    transition: transform 0.3s ease;
}

.logo:hover {
    transform: scale(1.05) rotate(5deg);
}

.wrapper {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
}

.brand h1 {
    font-size: 1.5rem;
    color: #2eb086;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
}

nav {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
}

nav a {
    text-decoration: none;
    color: #64748b;
    padding: 8px 16px;
    border-radius: 10px;
    transition: all 0.2s ease;
    font-weight: 600;
}

nav a:hover {
    color: #2eb086;
    background-color: #f0fdf4;
}

nav a.router-link-exact-active {
    color: white;
    background: linear-gradient(135deg, #2eb086 0%, #269672 100%);
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(46, 176, 134, 0.3);
}

.logout-btn {
    margin-left: 16px;
    background: white;
    border: 2px solid #ef4444;
    color: #ef4444;
    padding: 8px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    font-family: inherit;
}

.logout-btn:hover {
    background: #ef4444;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.logout-btn:active {
    transform: translateY(0);
}

/* Style spécifique quand on est sur l'écran de login */
.auth-mode {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Animations d'entrée */
header {
    animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive */
@media (max-width: 768px) {
    header {
        padding: 1rem 1.5rem;
        flex-wrap: wrap;
    }

    .logo {
        width: 60px;
        height: 60px;
        margin: 0 1rem 0 0;
    }

    .wrapper {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        gap: 12px;
    }

    .brand h1 {
        font-size: 1.3rem;
    }

    nav {
        width: 100%;
        flex-wrap: wrap;
        gap: 8px;
    }

    nav a {
        padding: 6px 12px;
        font-size: 0.9rem;
    }

    .logout-btn {
        margin-left: auto;
        padding: 6px 16px;
        font-size: 0.85rem;
    }
}

@media (min-width: 1024px) {
    header {
        padding: 1.5rem 3rem;
    }

    .logo {
        margin-right: 3rem;
    }

    nav {
        gap: 12px;
    }

    nav a {
        padding: 10px 20px;
    }
}
</style>
