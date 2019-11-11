<script>
    export let name;
    export let menu;
    export let url;
</script>

<style>
    .container {
        width: 100%;
        height: auto;
        background: var(--menu-container-background);
        margin: 16px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.05);
    }

    @media screen and (min-width: 768px) {
        .container {
            max-width: calc(100% / 2 - 32px);
        }
    }

    @media screen and (min-width: 1024px) {
        .container {
            max-width: calc(100% / 3 - 32px);
            margin-bottom: auto;
        }
    }

    h1 {
        font-size: 2rem;
        font-weight: bold;
        background: var(--menu-header-background);
        padding: 12px;
        box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1), 0 0 10px rgba(0, 0, 0, 0.03);
    }

    .content {
        padding: 0 12px 12px;
    }

    ul {
        padding-left: 16px;
        margin: 0;
    }

    li {
        list-style-type: circle;
        line-height: 1.6;
    }

    p {
        margin: 12px 0;
    }
</style>

<div class="container">
    <a href={url}>
        <h1>{name}</h1>
    </a>
    <div class="content">
        {#if !menu}
            <p>Ruokalistaa ei löytynyt</p>
        {:else}
            <ul>
                {#each menu.foods as food}
                    <li>{food}</li>
                {/each}
            </ul>
            {#if menu.pizzas}
                <p>
                    <strong>Pitsat</strong>
                </p>
                <ul>
                    {#each menu.pizzas as food}
                        <li>{food}</li>
                    {/each}
                </ul>
            {/if}
            {#if menu.salads}
                <p>
                    <strong>Salaatit</strong>
                </p>
                <ul>
                    {#each menu.salads as food}
                        <li>{food}</li>
                    {/each}
                </ul>
            {/if}
        {/if}
    </div>
</div>
