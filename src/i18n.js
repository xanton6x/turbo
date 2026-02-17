import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: { translation: { login: "Login", logout: "Logout", register: "Sign Up", home: "Home", categories: "Categories", dir: "ltr" } },
  ru: { translation: { login: "Вход", logout: "Выход", register: "Регистрация", home: "Главная", categories: "Категории", dir: "ltr" } },
  he: { translation: { login: "התחברות", logout: "התנתקות", register: "הרשמה", home: "בית", categories: "קטגוריות", dir: "rtl" } }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;