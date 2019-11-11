<script>
    import { onMount } from "svelte";
    import FoodList from "./components/FoodList.svelte";
    import parameters from "./utils/parameters.js";

    let todaysMenus = [];
    let lastUpdated = null;

    let { day } = parameters();

    fetch("data.json")
        .then(response => response.json())
        .then(json => {
            // Gets the menus from the data for the selected language only and transforms
            // the object into
            // TODO: move logic to data lambda
            todaysMenus = json.restaurants.map(d => ({
                name: d.name,
                url: d.url,
                menu: d.menu.filter(obj => obj.day.toLowerCase() === day)[0]
            }));

            lastUpdated = new Date(json.lastUpdated)
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");
        })
        .catch(e => console.error(e));

    }
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
        margin: 16px 2vw 0;
    }

    h1 {
        font-size: 2.8rem;
        font-weight: bold;
        margin: 0;
        flex-grow: 1;
    }

    .weekdays {
        margin: 16px 2vw 0;
    }

    .weekdays a {
        margin: 4px 16px 0 0;
    }

    .weekdays a.selected {
        font-weight: bold;
        text-decoration: underline;
    }

    button {
        margin: 16px auto 0 2vw;
        font-size: 1.4rem;
        border-radius: 8px;
    }

    section {
        margin-top: 16px;
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        flex-grow: 1;
    }

    .updated {
        font-size: 1.2rem;
        margin: 24px auto;
        text-align: center;
        flex-shrink: 0;
    }
</style>

<main class="container">
    <header>
        <h1>
            Ruokalistat päivälle
            <u>{day}</u>
        </h1>
    </header>
    <div class="weekdays">
        <a class:selected={day === 'maanantai'} href="?paiva=maanantai">Maanantai</a>
        <a class:selected={day === 'tiistai'} href="?paiva=tiistai">Tiistai</a>
        <a class:selected={day === 'keskiviikko'} href="?paiva=keskiviikko">Keskiviikko</a>
        <a class:selected={day === 'torstai'} href="?paiva=torstai">Torstai</a>
        <a class:selected={day === 'perjantai'} href="?paiva=perjantai">Perjantai</a>
    </div>
    {#if todaysMenus.length === 0}
        <p>Ladataan...</p>
        >
    {:else}
        <section>
            {#each todaysMenus as restaurant}
                <FoodList name={restaurant.name} url={restaurant.url} menu={restaurant.menu} />
            {/each}
        </section>
        <footer class="updated">Tiedot päivitetty {lastUpdated}</footer>
    {/if}
</main>
