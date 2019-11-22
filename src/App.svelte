<script>
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

    function randomize() {
        const randomIndex = Math.floor(Math.random() * todaysMenus.length);
        const winner = todaysMenus[randomIndex].name;
        alert(winner);
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

    .foodlist-container {
        width: 100%;
        height: auto;
        background: var(--menu-container-background);
        margin: 16px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.05);
    }

    @media screen and (min-width: 768px) {
        .foodlist-container {
            max-width: calc(100% / 2 - 32px);
        }
    }

    @media screen and (min-width: 1024px) {
        .foodlist-container {
            max-width: calc(100% / 3 - 32px);
            margin-bottom: auto;
        }
    }

    .foodlist-container h2 {
        font-size: 2rem;
        font-weight: bold;
        background: var(--menu-header-background);
        padding: 12px;
        box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1), 0 0 10px rgba(0, 0, 0, 0.03);
    }

    .foodlist-container .content {
        padding: 0 12px 12px;
    }

    .foodlist-container ul {
        padding-left: 16px;
        margin: 0;
    }

    .foodlist-container li {
        list-style-type: circle;
        line-height: 1.6;
    }

    .foodlist-container p {
        margin: 12px 0;
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
    <button on:click={randomize}>Valitse puolestani</button>
    {#if todaysMenus.length === 0}
        <p>Ladataan...</p>
        >
    {:else}
        <section>
            {#each todaysMenus as restaurant}
                <div class="foodlist-container">
                    <a href={restaurant.url}>
                        <h2>{restaurant.name}</h2>
                    </a>
                    <div class="content">
                        {#if !restaurant.menu}
                            <p>Ruokalistaa ei löytynyt</p>
                        {:else}
                            <ul>
                                {#each restaurant.menu.foods as food}
                                    <li>{food}</li>
                                {/each}
                            </ul>
                            {#if restaurant.menu.pizzas}
                                <p>
                                    <strong>Pitsat</strong>
                                </p>
                                <ul>
                                    {#each restaurant.menu.pizzas as food}
                                        <li>{food}</li>
                                    {/each}
                                </ul>
                            {/if}
                            {#if restaurant.menu.salads}
                                <p>
                                    <strong>Salaatit</strong>
                                </p>
                                <ul>
                                    {#each restaurant.menu.salads as food}
                                        <li>{food}</li>
                                    {/each}
                                </ul>
                            {/if}
                        {/if}
                    </div>
                </div>
            {/each}
        </section>
        <footer class="updated">Tiedot päivitetty {lastUpdated}</footer>
    {/if}
</main>
