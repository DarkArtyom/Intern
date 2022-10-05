const refs = {
  bodyEl: document.querySelector("body"),
  renderModalBox: document.querySelector(".modal-render-box"),
  pokemonListEl: document.querySelector(".pokemons-list"),
  closeModalButton: document.querySelector("[data-button-close]"),
  backdropEl: document.querySelector(".backdrop"),
};

const URL = "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20";

async function getPokemons() {
  const pokemonData = await fetch(URL)
    .then((response) => response.json())
    .then((res) => res.results);
  const pokemons = [];
  for (const pokemon of pokemonData) {
    const data = await fetch(pokemon.url).then((res) => res.json());
    pokemons.push(data);
  }
  return pokemons;
}

function renderPokemons(pokemons) {
  const pokemonsForRender = pokemons
    .map(
      (
        pokemon
      ) => `<li class="pokemon-item" id=${pokemon.name}><a class="pokemon-link link" href="#"><img class="pokemon-img"
     src="${pokemon.sprites.other.dream_world.front_default}" alt="${pokemon.name}" /><p class="pokemon-name">Name: ${pokemon.name}</p></a></li>`
    )
    .join("");
  refs.pokemonListEl.insertAdjacentHTML("beforeend", pokemonsForRender);
}
getPokemons().then(renderPokemons);

refs.pokemonListEl.addEventListener("click", renderModalPokemon);
async function renderModalPokemon(event) {
  if (!event.target.closest(".pokemon-item")) {
    return;
  }
  refs.backdropEl.classList.remove("is-hidden");
  window.addEventListener("keydown", onEscClose);
  stopScrollWhenModalOpen();
  let pokemonName = event.target.closest(".pokemon-item").getAttribute("id");
  //   console.log(pokemonName);

  const pokemonInfo = await fetchPokemonInfo(pokemonName);
  const pokemonDescription = await fetchPokemonDescription(pokemonInfo);

  let idOfPokemon = pokemonInfo.id;
  let indexOfMovesByLvl = pokemonInfo.moves.find(
    (moves, index) => index === idOfPokemon
  );
  // console.log(pokemonInfo);
  const pokemonMoves = await fetchPokemonMove(indexOfMovesByLvl);
  console.log(pokemonMoves);
  // if we need all moves ----------
  //   for (const move of pokemonInfo.moves) {
  //     const pokemonMoves = await fetch(move.move.url).then((res) => res.json());
  //     console.log(pokemonMoves);
  //   }
  const valueStats = pokemonInfo.stats.reduce((acc, stats) => {
    return (
      acc +
      `<li class="modal_stats-item"><p>${stats.stat.name}: ${stats.base_stat}</p></li>`
    );
  }, "");

  const pokemonTypes = pokemonInfo.types
    .map((type) => `<li class="types-list list">${type.type.name}</li>`)
    .join("");

  renderPokemonModal(
    pokemonInfo,
    pokemonTypes,
    pokemonDescription,
    valueStats,
    pokemonMoves
  );
}

refs.closeModalButton.addEventListener("click", onModalButtonClose);
refs.backdropEl.addEventListener("click", onBackdropClick);
function onModalButtonClose() {
  refs.backdropEl.classList.add("is-hidden");
  refs.renderModalBox.innerHTML = "";
  refs.bodyEl.style.overflowY = "visible";
}
function onEscClose(event) {
  if (event.code === "Escape") {
    window.removeEventListener("keydown", onEscClose);
    onModalButtonClose();
  }
}
function onBackdropClick(event) {
  if (event.currentTarget === event.target) {
    onModalButtonClose();
  }
}
function stopScrollWhenModalOpen() {
  refs.bodyEl.style.overflowY = "hidden";
}

async function fetchPokemonInfo(pokemonName) {
  return await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    .then((response) => response.json())
    .then((res) => res);
}
async function fetchPokemonDescription(pokemonInfo) {
  return await fetch(pokemonInfo.species.url)
    .then((res) => res.json())
    .then((res) => res.flavor_text_entries[0].flavor_text);
}

async function fetchPokemonMove(indexOfMovesByLvl) {
  return await fetch(indexOfMovesByLvl.move.url).then((res) => res.json());
}

function renderPokemonModal(
  pokemonInfo,
  pokemonTypes,
  pokemonDescription,
  valueStats,
  pokemonMoves
) {
  const renderPokemonOnModal = `<div class="modal-general"><div class="img-box"><h2 class="modal_pokemon-name">${pokemonInfo.name}</h2><img class="modal_img" src="${pokemonInfo.sprites.other.dream_world.front_default}" alt="${pokemonInfo.name}" /></div>
<div class="modal__content">
  <ul class="pokemon-types-list list'>${pokemonTypes}</ul><p>${pokemonDescription}</p>  
</div></div>
<div class="modal_stats-box"><h2>Base Stats</h2><ul class="modal_stats-list list">${valueStats}</ul></div>
<div class="modal_moves-box"><div class="modal_moves-wrap"><h3 class="modal_moves-type">${pokemonMoves.name}</h3><div class="modal_damage-wrap"><p class="modal_moves-damage">${pokemonMoves.type.name}</p><p class="modal_moves-damage">${pokemonMoves.damage_class.name}</p></div></div>
<div class="modal_moves-list"><p>pp: ${pokemonMoves.pp} </p><p>power: ${pokemonMoves.power}</p><p>accuracy: ${pokemonMoves.accuracy}</p></div>`;
  refs.renderModalBox.insertAdjacentHTML("beforeend", renderPokemonOnModal);
}
