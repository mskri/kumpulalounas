<script>
    import { onMount } from "svelte";
    import FoodList from "./components/FoodList.svelte";
    import parameters from "./utils/parameters.js";
    import i18n from "./utils/i18n.js";

    let cookies = {};
    let lightTheme = false;
    let todaysMenus = [];
    let lastUpdated = null;

    let { language, day } = parameters();

    fetch("data.json")
        .then(response => response.json())
        .then(json => {
            // Gets the menus from the data for the selected language only and transforms
            // the object into
            // TODO: move logic to data lambda
            todaysMenus = json.restaurants.map(d => ({
                restaurantName: d.restaurantName,
                url: d.url,
                menu: d.menus[language].filter(obj => obj.day.toLowerCase() === day)[0]
            }));

            lastUpdated = new Date(json.lastUpdated)
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");
        })
        .catch(e => console.error(e));

    // Get cookies
    document.cookie.split(";").forEach(d => {
        let parts = d.split("=");
        cookies[parts[0]] = parts[1];
    });

    function themeChange() {
        lightTheme = !lightTheme;

        if (lightTheme) {
            document.cookie = "theme=light; path=/";
            document.body.classList.add("light");
        } else {
            document.cookie = "theme=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.body.classList.remove("light");
        }
    }

    onMount(() => {
        if (cookies.theme == "light") {
            themeChange();
            document.getElementById("themeSwitch").checked = true;
        }
    });
</script>

<style>
    .container {
        width: 90vw;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        min-height: 100%;
        position: relative;
    }

    header {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

    h1 {
        font-size: 2.8rem;
        font-weight: bold;
        margin: 16px 2vw 0;
        flex-grow: 1;
    }

    .weekdays {
        margin: 16px;
    }

    .weekdays a {
        margin-right: 16px;
    }

    .switch {
        font-size: 1.2rem;
        opacity: 0.65;
        min-width: 100px;
        flex-shrink: 0;
        margin: 8px 8px 0;
    }

    @media screen and (min-width: 768px) {
        .switch {
            margin-top: 16px;
        }
    }

    section {
        margin-top: 16px;
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        flex-grow: 1;
    }

    footer {
        font-size: 1.2rem;
        margin: 16px auto;
        text-align: center;
        flex-shrink: 0;
    }
</style>

<main class="container">
    <header>
        <h1>
            {i18n('title')}
            <u>{day}</u>
        </h1>
        <label class="switch">
            {i18n('theme_mode')}
            <input id="themeSwitch" type="checkbox" on:change={themeChange} />
        </label>
    </header>
    <div class="weekdays">
        <a href="?day=maanantai">{i18n('monday')}</a>
        <a href="?day=tiistai">{i18n('tuesday')}</a>
        <a href="?day=keskiviikko">{i18n('wednesday')}</a>
        <a href="?day=torstai">{i18n('thursday')}</a>
        <a href="?day=perjantai">{i18n('friday')}</a>
    </div>
    {#if todaysMenus.length === 0}
        <p>{i18n('loading')}</p>
    {:else}
        <section>
            {#each todaysMenus as restaurant}
                <FoodList
                    restaurantName={restaurant.restaurantName}
                    url={restaurant.url}
                    menu={restaurant.menu}
                    {language} />
            {/each}
        </section>
    {/if}
    <footer>{i18n('last_updated') + ' ' + lastUpdated}</footer>
</main>
