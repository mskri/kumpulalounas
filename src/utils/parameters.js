import { allowedLanguages } from "./i18n.js";

const getQueryParams = () => {
    let vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (_, key, value) => {
        vars[key] = value;
    });
    return vars;
};

const parameters = () => {
    const params = getQueryParams();
    const language = allowedLanguages.includes(params.language) ? params.language : "fi";
    const currentDay = new Date()
        .toLocaleDateString(language, {
            weekday: "long"
        })
        .toLowerCase();

    const day = params.day || currentDay;

    return {
        language,
        day
    };
};

export default parameters;
