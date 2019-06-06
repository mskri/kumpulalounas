import parameters from "./parameters.js";

const defaultLanguage = "fi";
const allowedLanguages = ["fi", "en"];

const strings = {
    loading: ["Ladataan...", "Loading..."],
    title: ["Ruokalistat päivälle ", "Menus for "],
    pizzas: ["Pitsat", "Pizzas"],
    salads: ["Salaatit", "Salads"],
    no_menu_found: ["Ruokalistaa ei löytynyt.", "Menu was not found."],
    last_updated: ["Tiedot päivitetty", "Data updated"],
    theme_mode: ["Vaalea teema", "Light mode"]
};

const i18n = key => {
    const { language } = parameters();
    const index = language === defaultLanguage ? 0 : 1;
    return strings[key][index];
};

export default i18n;
export { allowedLanguages };
