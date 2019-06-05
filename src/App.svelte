<script>
  export let name;

  import Restaurant from "./components/Restaurant.svelte";

  let restaurants = [];

  fetch("data.json")
    .then(response => response.json())
    .then(json => {
      restaurants = json;
    })
    .catch(e => console.log(e));

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

  const lang = "fi";
  const currentDayName = new Date().toLocaleDateString(lang, {
    weekday: "long"
  });

  const todayIsTitle = lang === "en" ? "Menus for " : "Ruokalistat päivälle ";
</script>

<style>
  .container {
    width: 90vw;
    margin: 16px auto 40px;
  }

  h1 {
    font-size: 2.8rem;
    font-weight: bold;
    margin: 0 2vw;
  }

  main {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
  }
</style>

<div class="container">
  {#if restaurants.length === 0}
    <p>Loading...</p>
  {:else}
    <h1>
       {todayIsTitle}
      <u>{currentDayName}</u>
    </h1>
    <main>
      {#each restaurants as restaurant}
        <Restaurant {restaurant} />
      {/each}
    </main>
  {/if}
</div>
