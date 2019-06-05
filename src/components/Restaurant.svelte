<script>
  export let restaurant;

  function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(
      /[?&]+([^=&]+)=([^&]*)/gi,
      (_, key, value) => {
        vars[key] = value;
      }
    );
    return vars;
  }

  const urlVars = getUrlVars();
  const lang = urlVars["lang"] || "fi";
  const currentDayName =
    urlVars["day"] ||
    new Date().toLocaleDateString(lang, {
      weekday: "long"
    });

  const menu = restaurant.menus[lang].find(
    menu => menu.day.toLowerCase() === currentDayName
  );

  const pizzasTitle = lang === "en" ? "Pizzas" : "Pitsat";
  const saladsTitle = lang === "en" ? "Salads" : "Salaatit";

  //   console.log(Object.values(menu.foods));
</script>

<style>
  .container {
    min-width: 320px;
    width: 26vw;
    height: auto;
    background: #fff;
    margin: 8px 2vw auto;
    border-radius: 8px;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.05);
  }

  .content {
    padding: 0 12px 12px;
  }

  h1 {
    font-size: 2rem;
    font-weight: bold;
    background: #f5f5f5;
    padding: 12px;
  }

  ul {
    padding-left: 16px;
    margin: 0;
  }

  li {
    list-style-type: circle;
    line-height: 1.6;
  }
</style>

<div class="container">
  {#if !menu}
    <p>Error in parameters</p>
  {:else}
    <h1>{restaurant.restaurantName}</h1>
    <div class="content">
      <ul>
        {#each menu.foods as food}
          <li>{food}</li>
        {/each}
      </ul>
      {#if menu.pizzas}
        <p>
          <strong>{pizzasTitle}</strong>
        </p>
        <ul>
          {#each menu.pizzas as food}
            <li>{food}</li>
          {/each}
        </ul>
      {/if}
      {#if menu.salads}
        <p>
          <strong>{saladsTitle}</strong>
        </p>
        <ul>
          {#each menu.pizzas as food}
            <li>{food}</li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>
