import './main.scss';
import axios from 'axios';
import 'core-js/es/function';
import 'regenerator-runtime/runtime';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

// Audio
const musicButton = document.getElementById('musicButton');
const audio = document.getElementById('audio');
audio.volume = 0.03;
const musicStop = () => {
  audio.pause();
  audio.currentTime = 0;
};
musicButton.addEventListener('click', () => {
  // eslint-disable-next-line no-unused-expressions
  audio.paused ? audio.play() : musicStop();
});
const clickAudio = new Audio('/music/clickMusic.mp3');
clickAudio.volume = 0.4;

// Game Screens
const loginScreen = document.getElementById('loginScreen');
const registerScreen = document.getElementById('registerScreen');
const lobbyScreen = document.getElementById('lobbyScreen');
const pokedexScreen = document.getElementById('pokedexScreen');
const roomScreen = document.getElementById('roomScreen');
const loadoutScreen = document.getElementById('loadoutScreen');
const battleScreen = document.getElementById('battleScreen');
const messageScreen = document.getElementById('messageScreen');

// Login Elements
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const loginButton = document.getElementById('loginButton');
const registerLink = document.getElementById('register');
const registerButton = document.getElementById('registerButton');

// Register Elements
const registerEmail = document.getElementById('registerEmail');
const registerEmailError = document.getElementById('registerEmailError');
const registerPassword = document.getElementById('registerPassword');
const registerDisplayName = document.getElementById('displayName');
const registerSprite = document.getElementById('registerSprite');
const registerBackButton = document.getElementById('registerBackButton');
const registerSpriteDisplay = document.getElementById('registerSpriteDisplay');

// Lobby Elements
const lobbyName = document.getElementById('lobbyName');
const lobbySprite = document.getElementById('lobbySprite');
const lobbyStats = document.getElementById('lobbyStats');
const lobbyPokedexButton = document.getElementById('lobbyPokedexButton');
const gameList = document.getElementById('gameList');
const lobbyLogOutButton = document.getElementById('lobbyLogOutButton');
const lobbyCreateRoomButton = document.getElementById('lobbyCreateRoomButton');

// Pokedex Elements
const pokedexList = document.getElementById('pokedexList');
const pokedexLargeSprite = document.getElementById('pokedexLargeSprite');
const pokedexName = document.getElementById('pokedexName');
const pokedexType = document.getElementById('pokedexType');
const pokedexDescription = document.getElementById('pokedexDescription');
const pokedexMovesHeader = document.getElementById('pokedexMovesHeader');
const pokedexMove1 = document.getElementById('pokedexMove1');
const pokedexMove2 = document.getElementById('pokedexMove2');
const pokedexMove3 = document.getElementById('pokedexMove3');
const pokedexMove4 = document.getElementById('pokedexMove4');
const pokedexStats = document.getElementById('pokedexStats');
const pokedexBackButton = document.getElementById('pokedexBackButton');

// Room Elements
const roomPrimaryDisplayName = document.getElementById('roomPrimaryDisplayName');
const roomPrimarySprite = document.getElementById('roomPrimarySprite');
const roomSecondaryDisplayName = document.getElementById('roomSecondaryDisplayName');
const roomSecondarySprite = document.getElementById('roomSecondarySprite');
const roomConfirmationText = document.getElementById('roomConfirmationText');
const roomStartGame = document.getElementById('roomStartGame');
const roomBackButton = document.getElementById('roomBackButton');

// Loadout Elements
const smallSpriteRow1 = document.getElementById('smallSpriteRow1');
const smallSpriteRow2 = document.getElementById('smallSpriteRow2');
const loadoutLargeSpriteDisplay = document.getElementById('loadoutLargeSpriteDisplay');
const loadoutConfirmButton = document.getElementById('loadoutConfirmButton');
const loadoutConfirmationText = document.getElementById('loadoutConfirmationText');

// Battle Elements
const battleUserSprite = document.getElementById('battleUserSprite');
const battleOpponentSprite = document.getElementById('battleOpponentSprite');
const battleUserDisplayName = document.getElementById('battleUserDisplayName');
const battleOpponentDisplayName = document.getElementById('battleOpponentDisplayName');
const battleOpponentPokemonStatus = document.getElementById('battleOpponentPokemonStatus');
const battleOpponentPokemonSprite = document.getElementById('battleOpponentPokemonSprite');
const battleUserPokemonStatus = document.getElementById('battleUserPokemonStatus');
const battleUserPokemonSprite = document.getElementById('battleUserPokemonSprite');
const battleFightButton = document.getElementById('battleFightButton');
const battlePokemonButton = document.getElementById('battlePokemonButton');
const battleSurrenderButton = document.getElementById('battleSurrenderButton');

// === GAME LOGIC BELOW ===

const calculateWinRate = (won, total) => {
  const winRate = 0;
  if (!total) {
    return winRate;
  }
  return ((won / total) * 100).toFixed(2);
};

const roomCheck = async () => {
  const result = await axios.get('/rooms/show');
  return result;
};

const tabulateRound = async () => {
  const room = await roomCheck();
  const { id } = room.data;
  const result = await axios.get(`/battles/tabulateRound/${id}`);
  return result;
};

const pokemonConfirmAction = async (fromPokemon, toPokemon, toPokemonIndex) => {
  const room = await roomCheck();
  const { id } = room.data;
  const result = await axios.post(`/battles/pokemon/${id}`, { fromPokemon, toPokemon, toPokemonIndex });
  if (result.data) {
    await tabulateRound();
    socket.emit('advance-inner-gamestate', id);
  }
};

const battleJsonCheck = async () => {
  const room = await roomCheck();
  const { id } = room.data;
  const battleInfo = await axios.get(`/battles/show/${id}`);
  return battleInfo;
};

const generateHpBar = (current, max) => {
  const hpPercentage = Math.round((current / max) * 100);
  let color = '';
  if (hpPercentage >= 75) {
    color = 'bg-success';
  } else if (hpPercentage >= 40) {
    color = 'bg-warning';
  } else {
    color = 'bg-danger';
  }
  return [hpPercentage, color];
};

const waitingforActionGenerate = () => {
  const div = document.createElement('div');
  div.id = 'waitingForAction';
  div.classList.add('overlayLargeMessage', 'fs-2', 'pt-5', 'text-center');
  div.innerText = "Waiting for other player's action...";
  messageScreen.appendChild(div);
};

const generateGenericMessage = (text, toPrepend) => {
  const div = document.createElement('div');
  div.classList.add('overlayLargeMessage', 'fs-2', 'pt-4', 'text-center');
  div.innerHTML = `${text}</br>`;
  const nextButton = document.createElement('button');
  nextButton.classList.add('btn', 'btn-warning', 'ms-4');
  nextButton.innerText = 'Click to continue';
  nextButton.addEventListener('click', () => {
    div.remove();
  });
  div.appendChild(nextButton);
  if (toPrepend) {
    messageScreen.prepend(div);
  } else {
    messageScreen.appendChild(div);
  }
};

const pokemonMessageOverlay = async () => {
  const userBattleInfo = await battleJsonCheck();
  const allPokeList = JSON.parse(JSON.stringify(userBattleInfo.data.pokemon));
  const allPokeNames = [];
  allPokeList.forEach((x) => {
    allPokeNames.push(x.pokemonName);
  });
  const { activePokemonIndex, pokemon, requireChangePokemon } = userBattleInfo.data;
  const activePokemon = pokemon[activePokemonIndex];
  pokemon.splice(activePokemonIndex, 1);

  const pokemonDiv = document.createElement('div');
  pokemonDiv.classList.add('overlayLargeMessage', 'row');

  const pokemonSpriteDiv = document.createElement('div');
  pokemonSpriteDiv.classList.add('col', 'd-flex', 'justify-content-center', 'align-items-center');

  const pokemonSpriteRow = document.createElement('div');
  pokemonSpriteRow.classList.add('row');

  const pokemonSprite1 = document.createElement('div');
  pokemonSprite1.classList.add('col', 'text-center');
  const pokemonSprite2 = document.createElement('div');
  pokemonSprite2.classList.add('col', 'text-center');

  pokemonSpriteRow.appendChild(pokemonSprite1);
  pokemonSpriteRow.appendChild(pokemonSprite2);
  pokemonSpriteDiv.appendChild(pokemonSpriteRow);

  const pokemonSprite1Button = document.createElement('button');
  pokemonSprite1Button.classList.add('btn', 'btn-secondary', 'border', 'border-2', 'border-dark', 'pokemonSwapSpriteDiv');
  pokemonSprite1Button.innerHTML = `${pokemon[0].pokemonName}</br>(HP: ${pokemon[0].currentHp} / ${pokemon[0].maxHp})</br>`;
  const pokemonSprite1Img = document.createElement('img');
  pokemonSprite1Img.classList.add('pokemonSwapSprite');
  pokemonSprite1Img.src = pokemon[0].smallSprite;
  pokemonSprite1Button.appendChild(pokemonSprite1Img);
  pokemonSprite1.appendChild(pokemonSprite1Button);
  if (!pokemon[0].currentHp) {
    pokemonSprite1Button.disabled = true;
  }

  const pokemonSprite2Button = document.createElement('button');
  pokemonSprite2Button.classList.add('btn', 'btn-secondary', 'border', 'border-2', 'border-dark', 'pokemonSwapSpriteDiv');
  pokemonSprite2Button.innerHTML = `${pokemon[1].pokemonName}</br>(HP: ${pokemon[1].currentHp} / ${pokemon[1].maxHp})`;
  const pokemonSprite2Img = document.createElement('img');
  pokemonSprite2Img.classList.add('pokemonSwapSprite');
  pokemonSprite2Img.src = pokemon[1].smallSprite;
  pokemonSprite2Button.appendChild(pokemonSprite2Img);
  pokemonSprite2.appendChild(pokemonSprite2Button);
  if (!pokemon[1].currentHp) {
    pokemonSprite2Button.disabled = true;
  }

  const pokemonConfirmDiv = document.createElement('div');
  pokemonConfirmDiv.classList.add('col', 'd-flex', 'flex-column-reverse', 'justify-content-center');

  const pokemonInfoDiv = document.createElement('div');
  pokemonInfoDiv.classList.add('row', 'px-3', 'mb-3');
  const pokemonInfo = document.createElement('div');
  pokemonInfo.classList.add('col-8');
  pokemonInfo.innerHTML = '<h5>Swap a Pokémon</h5>';
  pokemonInfoDiv.appendChild(pokemonInfo);

  const pokemonConfirm = document.createElement('div');
  pokemonConfirm.classList.add('col');
  pokemonInfoDiv.appendChild(pokemonConfirm);

  pokemonSprite1Button.addEventListener('click', () => {
    pokemonInfo.innerHTML = '';
    pokemonInfo.innerHTML = `Confirm swap to ${pokemon[0].pokemonName}?`;
    pokemonConfirm.innerHTML = '';
    const pokemonConfirmButton = document.createElement('button');
    pokemonConfirmButton.classList.add('btn', 'btn-warning');
    pokemonConfirmButton.innerText = 'Confirm';
    pokemonConfirmButton.addEventListener('click', () => {
      clickAudio.play();
      pokemonConfirmAction(
        activePokemon.pokemonName,
        pokemon[0].pokemonName,
        allPokeNames.indexOf(pokemon[0].pokemonName),
      );
      pokemonDiv.remove();
      waitingforActionGenerate();
    });
    pokemonConfirm.appendChild(pokemonConfirmButton);
  });

  pokemonSprite2Button.addEventListener('click', () => {
    pokemonInfo.innerHTML = `Confirm swap to ${pokemon[1].pokemonName}?`;
    pokemonConfirm.innerHTML = '';
    const pokemonConfirmButton = document.createElement('button');
    pokemonConfirmButton.classList.add('btn', 'btn-warning');
    pokemonConfirmButton.innerText = 'Confirm';
    pokemonConfirmButton.addEventListener('click', () => {
      clickAudio.play();
      pokemonConfirmAction(
        activePokemon.pokemonName,
        pokemon[1].pokemonName,
        allPokeNames.indexOf(pokemon[1].pokemonName),
      );
      pokemonDiv.remove();
      waitingforActionGenerate();
    });
    pokemonConfirm.appendChild(pokemonConfirmButton);
  });
  if (!requireChangePokemon) {
    clickAudio.play();
    const backDiv = document.createElement('div');
    backDiv.classList.add('row', 'p-3');
    const backButton = document.createElement('button');
    backButton.classList.add('btn', 'btn-secondary');
    backButton.innerText = 'Back';
    backButton.addEventListener('click', () => {
      clickAudio.play();
      pokemonDiv.remove();
    });
    backDiv.appendChild(backButton);

    pokemonConfirmDiv.appendChild(backDiv);
  }

  pokemonConfirmDiv.appendChild(pokemonInfoDiv);

  pokemonDiv.appendChild(pokemonSpriteDiv);
  pokemonDiv.appendChild(pokemonConfirmDiv);
  messageScreen.prepend(pokemonDiv);
};

battlePokemonButton.addEventListener('click', pokemonMessageOverlay);

const winnerMessageOverlay = (winner) => {
  const div = document.createElement('div');
  div.classList.add('overlayLargeMessage', 'fs-1', 'fw-bold', 'pt-4', 'text-center');
  div.innerHTML = `${winner}</br>`;
  const backToLobbyButton = document.createElement('button');
  backToLobbyButton.innerHTML = 'Back to Lobby';
  backToLobbyButton.classList.add('btn', 'btn-warning');
  div.appendChild(backToLobbyButton);
  backToLobbyButton.addEventListener('click', async () => {
    clickAudio.play();
    const result = await roomCheck();
    if (result.data) {
      const { id } = result.data;
      await axios.get(`/battles/resetLobby/${id}`);
    }
    div.remove();
    window.location.reload();
  });
  if (winner.includes('surrendered')) {
    messageScreen.appendChild(div);
  } else {
    messageScreen.prepend(div);
  }
};

const populateBattleScreen = async () => {
  const roomInfo = await roomCheck();
  const { primaryUser, secondaryUser, gameState } = roomInfo.data;
  const userOpponentInfo = await axios.post('/users/getUserOpponentSprite', [primaryUser, secondaryUser]);
  const {
    userId, opponentId, userDisplayName, opponentDisplayName, userSprite, opponentSprite,
  } = userOpponentInfo.data;
  battleUserDisplayName.innerHTML = userDisplayName;
  battleOpponentDisplayName.innerHTML = opponentDisplayName;

  battleUserSprite.src = userSprite;
  battleOpponentSprite.src = opponentSprite;

  const userActivePokemon = gameState[userId].pokemon[gameState[userId].activePokemonIndex];
  battleUserPokemonStatus.innerHTML = `
  <h3>${userActivePokemon.pokemonName}</h3>
  HP: ${userActivePokemon.currentHp} / ${userActivePokemon.maxHp}`;

  const userHpBarElements = generateHpBar(userActivePokemon.currentHp, userActivePokemon.maxHp);
  const userActivePokemonHpBarWrapper = document.createElement('div');
  userActivePokemonHpBarWrapper.classList.add('progress', 'mt-2');
  const userActivePokemonHpBar = document.createElement('div');
  userActivePokemonHpBar.classList.add('progress-bar', `${userHpBarElements[1]}`);
  userActivePokemonHpBar.setAttribute('role', 'progressbar');
  userActivePokemonHpBar.style.width = `${userHpBarElements[0]}%`;
  userActivePokemonHpBarWrapper.appendChild(userActivePokemonHpBar);
  battleUserPokemonStatus.appendChild(userActivePokemonHpBarWrapper);

  const userRemainingPokemonWrapper = document.createElement('div');
  gameState[userId].pokemon.forEach((x) => {
    const currentPokeballImg = document.createElement('img');
    currentPokeballImg.classList.add('remainingPokemon');
    if (x.currentHp > 0) {
      currentPokeballImg.src = '/images/remainingPokemon/availablePokemon.png';
    } else {
      currentPokeballImg.src = '/images/remainingPokemon/faintedPokemon.png';
    }
    userRemainingPokemonWrapper.appendChild(currentPokeballImg);
  });
  battleUserPokemonStatus.appendChild(userRemainingPokemonWrapper);

  battleUserPokemonSprite.src = userActivePokemon.backSprite;
  // eslint-disable-next-line max-len
  const opponentActivePokemon = gameState[opponentId].pokemon[gameState[opponentId].activePokemonIndex];
  battleOpponentPokemonStatus.innerHTML = `
  <h3>${opponentActivePokemon.pokemonName}</h3>
  HP: ${opponentActivePokemon.currentHp} / ${opponentActivePokemon.maxHp}`;
  battleOpponentPokemonSprite.src = opponentActivePokemon.frontSprite;

  // eslint-disable-next-line max-len
  const opponentHpBarElements = generateHpBar(opponentActivePokemon.currentHp, opponentActivePokemon.maxHp);
  const opponentActivePokemonHpBarWrapper = document.createElement('div');
  opponentActivePokemonHpBarWrapper.classList.add('progress', 'mt-2');
  const opponentActivePokemonHpBar = document.createElement('div');
  opponentActivePokemonHpBar.classList.add('progress-bar', `${opponentHpBarElements[1]}`);
  opponentActivePokemonHpBar.setAttribute('role', 'progressbar');
  opponentActivePokemonHpBar.style.width = `${opponentHpBarElements[0]}%`;
  opponentActivePokemonHpBarWrapper.appendChild(opponentActivePokemonHpBar);
  battleOpponentPokemonStatus.appendChild(opponentActivePokemonHpBarWrapper);

  const opponentRemainingPokemonWrapper = document.createElement('div');
  gameState[opponentId].pokemon.forEach((x) => {
    const currentPokeballImg = document.createElement('img');
    currentPokeballImg.classList.add('remainingPokemon');
    if (x.currentHp > 0) {
      currentPokeballImg.src = '/images/remainingPokemon/availablePokemon.png';
    } else {
      currentPokeballImg.src = '/images/remainingPokemon/faintedPokemon.png';
    }
    opponentRemainingPokemonWrapper.appendChild(currentPokeballImg);
  });
  battleOpponentPokemonStatus.appendChild(opponentRemainingPokemonWrapper);

  if (gameState[userId].waitingForResponse && (!gameState.winner || gameState.winner === '')) {
    waitingforActionGenerate();
  }

  if (gameState.messages) {
    let toPrepend = false;
    if (gameState.messages.length === 1) {
      toPrepend = true;
    }
    for (let i = gameState.messages.length - 1; i >= 0; i -= 1) {
      generateGenericMessage(gameState.messages[i], toPrepend);
    }
  }
  if (gameState.winner && gameState.winner !== '') {
    winnerMessageOverlay(gameState.winner);
  } else if (gameState[userId].requireChangePokemon) {
    await pokemonMessageOverlay();
  }
};

const populateRoom = async () => {
  const result = await roomCheck();
  const { primary, secondary, isPlayerReady } = result.data;
  roomPrimaryDisplayName.innerHTML = `<h2>${primary.displayName}</h2>`;
  roomPrimarySprite.src = primary.userSprite.sprite;
  roomBackButton.disabled = false;

  if (secondary) {
    roomSecondaryDisplayName.innerHTML = `<h2>${secondary.displayName}</h2>`;
    roomSecondarySprite.src = secondary.userSprite.sprite;
    roomStartGame.disabled = false;
    roomConfirmationText.innerText = 'Confirm start game?';
    if (isPlayerReady) {
      roomConfirmationText.innerText = 'Awaiting other player response to start...';
      roomStartGame.disabled = true;
      roomBackButton.disabled = true;
    }
  } else {
    roomSecondaryDisplayName.innerHTML = '<h2>Waiting for 2nd player...</h2>';
    roomSecondarySprite.src = '';
    roomStartGame.disabled = true;
    roomConfirmationText.innerText = 'Welcome to pokébRAwl, waiting for 2nd player...';
  }
};

const populateLobbyScreen = async () => {
  const user = await axios.get('/users/getInfo');
  const {
    displayName, totalGames, wonGames, userSprite,
  } = user.data;
  const { sprite } = userSprite;

  lobbyName.innerText = displayName;
  lobbySprite.src = sprite;
  lobbyStats.innerHTML = `<strong><u>Battle Stats:</u></strong></br>
  Games Won: ${wonGames}</br>
  Games Lost: ${totalGames - wonGames}</br>
  Win Rate: ${calculateWinRate(wonGames, totalGames)}%`;

  const rooms = await axios.get('/rooms/index');
  if (rooms.data.length === 0) {
    gameList.innerHTML = 'No available rooms at the moment, try creating a room!';
    gameList.classList.add('d-flex', 'justify-content-center', 'align-items-center');
  } else {
    gameList.innerHTML = '';
    gameList.removeAttribute('class');
    gameList.classList.add('col');
    rooms.data.forEach((room) => {
      if (!room.secondaryUser) {
        const currentRoom = document.createElement('div');
        currentRoom.classList.add('row');

        const roomName = document.createElement('div');
        roomName.innerText = `${room.primary.displayName}'s room`;
        roomName.classList.add('col', 'fs-3');
        const roomButton = document.createElement('div');
        roomButton.classList.add('col');

        const clickToJoinButton = document.createElement('button');
        clickToJoinButton.classList.add('btn', 'btn-warning', 'float-end', 'fs-5');
        clickToJoinButton.innerText = 'Click to Join';

        clickToJoinButton.addEventListener('click', async () => {
          clickAudio.play();
          await axios.post('/rooms/join', { id: room.id });
          socket.emit('join-socket', room.id);
          roomScreen.style.display = 'block';
          lobbyScreen.style.display = 'none';
          populateRoom();
        });

        roomButton.appendChild(clickToJoinButton);
        currentRoom.appendChild(roomName);
        currentRoom.appendChild(roomButton);

        gameList.appendChild(currentRoom);
      }
    });
  }
};

registerLink.addEventListener('click', () => {
  loginScreen.style.display = 'none';
  registerScreen.style.display = 'block';
});

registerSprite.addEventListener('input', async () => {
  registerSpriteDisplay.innerHTML = '';
  const chosenSprite = document.createElement('img');
  const result = await axios.get(`/users/sprite/${registerSprite.value}`);
  chosenSprite.src = result.data;
  chosenSprite.classList.add('enlargeSprite');
  registerSpriteDisplay.appendChild(chosenSprite);
});

const registerReset = () => {
  registerEmail.value = '';
  registerPassword.value = '';
  registerDisplayName.value = '';
  registerSprite.selectedIndex = null;
  registerSpriteDisplay.innerHTML = '';
};

registerButton.addEventListener('click', async () => {
  const data = {
    email: registerEmail.value,
    password: registerPassword.value,
    displayName: registerDisplayName.value,
    userSpriteId: registerSprite.value,
    totalGames: 0,
    wonGames: 0,
  };
  const emailUniqueCheck = await axios.post('/users/emailCheck', { email: registerEmail.value });
  if (emailUniqueCheck.data) {
    clickAudio.play();
    await axios.post('/users/create', data);
    registerReset();
    loginScreen.style.display = 'block';
    registerScreen.style.display = 'none';
  } else {
    registerEmailError.innerText = 'Email address already exists!';
  }
});

registerBackButton.addEventListener('click', () => {
  clickAudio.play();
  registerReset();
  loginScreen.style.display = 'block';
  registerScreen.style.display = 'none';
});

const populatePokedexDescription = async (pokemon) => {
  const result = await axios.get(`/pokemons/show/${pokemon}`);

  const {
    // eslint-disable-next-line max-len
    pokedexSprite, pokemonName, pokemonType, description, move1, move2, move3, move4, hp, attack, defense, spAttack, spDefense, speed,
  } = result.data;

  pokedexLargeSprite.src = pokedexSprite;
  pokedexName.innerText = `Name: ${pokemonName}`;
  pokedexType.innerText = `Type: ${pokemonType}`;
  pokedexDescription.innerHTML = `<h2>Description</h2>${description}`;
  pokedexMovesHeader.innerText = 'Moves';
  pokedexMove1.innerHTML = `<strong>${move1.moveName}</strong></br>Type: ${move1.moveType}</br>Power: ${move1.power} | PP: ${move1.pp}`;
  pokedexMove2.innerHTML = `<strong>${move2.moveName}</strong></br>Type: ${move2.moveType}</br>Power: ${move2.power} | PP: ${move2.pp}`;
  pokedexMove3.innerHTML = `<strong>${move3.moveName}</strong></br>Type: ${move3.moveType}</br>Power: ${move3.power} | PP: ${move3.pp}`;
  pokedexMove4.innerHTML = `<strong>${move4.moveName}</strong></br>Type: ${move4.moveType}</br>Power: ${move4.power} | PP: ${move4.pp}`;
  pokedexStats.innerHTML = `<h2>Stats</h2>HP: ${hp} | Attack: ${attack} | Defense: ${defense} | Special Attack: ${spAttack} | Special Defense: ${spDefense} | Speed: ${speed}`;
};

const populatePokedexList = async () => {
  const result = await axios.get('/pokemons/index');
  result.data.forEach((current) => {
    const currentPokemon = document.createElement('div');
    currentPokemon.classList.add('row', 'btn-dark', 'pokedexList', 'justify-content-center');

    currentPokemon.addEventListener('click', () => {
      populatePokedexDescription(current.pokemonName);
    });

    const currentSprite = document.createElement('img');
    currentSprite.src = current.smallSprite;
    currentSprite.classList.add('smallSprite', 'col-2');
    currentPokemon.appendChild(currentSprite);

    const currentName = document.createElement('div');
    currentName.classList.add('col-8', 'text-center', 'fs-4');
    currentName.innerText = current.pokemonName;
    currentPokemon.appendChild(currentName);
    pokedexList.appendChild(currentPokemon);
  });
};

lobbyPokedexButton.addEventListener('click', async () => {
  clickAudio.play();
  lobbyScreen.style.display = 'none';
  pokedexScreen.style.display = 'block';
  populatePokedexList();
});

const pokedexReset = () => {
  pokedexLargeSprite.src = '';
  pokedexName.innerText = '';
  pokedexType.innerText = '';
  pokedexDescription.innerHTML = '';
  pokedexMovesHeader.innerText = '';
  pokedexMove1.innerHTML = '';
  pokedexMove2.innerHTML = '';
  pokedexMove3.innerHTML = '';
  pokedexMove4.innerHTML = '';
  pokedexStats.innerHTML = '';
  pokedexList.innerHTML = '';
};

pokedexBackButton.addEventListener('click', async () => {
  clickAudio.play();
  lobbyScreen.style.display = 'block';
  pokedexScreen.style.display = 'none';
  socket.emit('update-game-list');
  pokedexReset();
});

const createRoom = async () => {
  const result = await axios.get('/rooms/create');
  socket.emit('join-socket', result.data.id);
};

lobbyCreateRoomButton.addEventListener('click', async () => {
  clickAudio.play();
  lobbyScreen.style.display = 'none';
  roomScreen.style.display = 'block';
  socket.emit('update-game-list');
  await createRoom();
  populateRoom();
});

roomStartGame.addEventListener('click', async () => {
  clickAudio.play();
  roomStartGame.disabled = true;
  roomBackButton.disabled = true;
  roomConfirmationText.innerText = 'Awaiting other player response to start...';
  const result = await roomCheck();
  const { id, gameState } = result.data;
  if (!gameState.playerReady) {
    await axios.get(`/rooms/playerReady/${id}`);
  } else {
    await axios.get(`/rooms/advanceToLoadout/${id}`);
    socket.emit('room-ready', id);
  }
});

const advanceToLoadout = () => {
  roomScreen.style.display = 'none';
  loadoutScreen.style.display = 'block';
};

let selectedLoadout = [];

const populateLoadout = async () => {
  loadoutLargeSpriteDisplay.innerHTML = '';
  const promiseArr = [];
  selectedLoadout.forEach((x) => {
    promiseArr.push(axios.get(`/pokemons/show/${x}`));
  });

  const result = await Promise.all(promiseArr);
  result.forEach((x) => {
    const tempDiv = document.createElement('div');
    tempDiv.classList.add('col', 'text-center');
    const { pokemonName, pokedexSprite } = x.data;
    const nameH2 = document.createElement('h2');
    nameH2.innerText = pokemonName;
    const spriteImg = document.createElement('img');
    spriteImg.classList.add('loadoutPickedImg');
    spriteImg.src = pokedexSprite;
    tempDiv.appendChild(nameH2);
    tempDiv.appendChild(spriteImg);
    loadoutLargeSpriteDisplay.appendChild(tempDiv);
  });

  const allButtons = document.getElementsByClassName('smallSpriteCheck');
  if (selectedLoadout.length === 3) {
    loadoutConfirmButton.disabled = false;
    for (let i = 0; i < allButtons.length; i += 1) {
      if (!allButtons[i].checked) {
        allButtons[i].disabled = true;
      }
    }
  } else {
    for (let i = 0; i < allButtons.length; i += 1) {
      allButtons[i].disabled = false;
    }
  }
};

const addLoadout = async (pokemonName) => {
  const current = document.getElementById(`${pokemonName}SmallSprite`);
  if (!current.checked) {
    selectedLoadout.push(pokemonName);
  } else {
    loadoutConfirmButton.disabled = true;
    selectedLoadout.splice(selectedLoadout.indexOf(pokemonName), 1);
  }
  await populateLoadout();
};

const populateLoadoutPokemonButtons = async () => {
  const result = await axios.get('/pokemons/index');
  const pokeArr = result.data;
  for (let i = 0; i < pokeArr.length; i += 1) {
    const currentPokemon = document.createElement('div');
    currentPokemon.classList.add('col', 'text-center');

    const currentPokemonInput = document.createElement('input');
    currentPokemonInput.type = 'checkbox';
    currentPokemonInput.classList.add('btn-check', 'smallSpriteCheck');
    currentPokemonInput.id = `${pokeArr[i].pokemonName}SmallSprite`;

    const currentPokemonLabel = document.createElement('label');
    currentPokemonLabel.classList.add('btn', 'btn-outline-dark', 'smallSpriteButton');
    currentPokemonLabel.setAttribute('for', `${pokeArr[i].pokemonName}SmallSprite`);
    currentPokemonLabel.addEventListener('click', async () => {
      addLoadout(pokeArr[i].pokemonName);
    });
    const currentPokemonLabelImage = document.createElement('img');
    currentPokemonLabelImage.src = pokeArr[i].smallSprite;
    currentPokemonLabelImage.classList.add('smallSpriteLoadout');
    currentPokemonLabel.appendChild(currentPokemonLabelImage);

    currentPokemon.appendChild(currentPokemonInput);
    currentPokemon.appendChild(currentPokemonLabel);
    if (i < 5) {
      smallSpriteRow1.appendChild(currentPokemon);
    } else {
      smallSpriteRow2.appendChild(currentPokemon);
    }
  }
};

loadoutConfirmButton.addEventListener('click', async () => {
  clickAudio.play();
  if (selectedLoadout.length === 3) {
    loadoutConfirmButton.disabled = true;
    loadoutConfirmationText.innerText = "Waiting for other player's response...";
    loadoutConfirmationText.classList.add('border', 'border-dark');
    const allButtons = document.getElementsByClassName('smallSpriteCheck');
    for (let i = 0; i < allButtons.length; i += 1) {
      allButtons[i].disabled = true;
    }
    const promiseArr = [];

    selectedLoadout.forEach((x) => {
      promiseArr.push(axios.get(`/pokemons/show/${x}`));
    });
    const allPokemonData = await Promise.all(promiseArr);
    const result = await roomCheck();
    const { id } = result.data;
    const isBothReady = await axios.post(`/rooms/loadoutReady/${id}`, allPokemonData);
    if (isBothReady) {
      socket.emit('loadout-ready', id);
    }
  }
});

const advanceToBattle = () => {
  selectedLoadout = [];
  loadoutScreen.style.display = 'none';
  battleScreen.style.display = 'block';
  populateBattleScreen();
};

const surrenderConfirmAction = async () => {
  clickAudio.play();
  const room = await roomCheck();
  const { id } = room.data;
  const result = await axios.get(`/battles/surrender/${id}`);
  if (result.data) {
    socket.emit('advance-inner-gamestate', id);
  }
};

const surrenderMessageOverlay = () => {
  clickAudio.play();
  const surrenderDiv = document.createElement('div');
  surrenderDiv.classList.add('overlaySmallMessage', 'pt-4', 'ps-3', 'pe-5');

  const confirmationText = document.createElement('h3');
  confirmationText.classList.add('mb-4');
  confirmationText.innerText = 'Confirm surrender?';
  surrenderDiv.appendChild(confirmationText);

  const backButton = document.createElement('button');
  backButton.classList.add('btn', 'btn-secondary');
  backButton.innerText = 'Back';
  backButton.addEventListener('click', () => {
    clickAudio.play();
    surrenderDiv.remove();
  });
  surrenderDiv.appendChild(backButton);

  const confirmButton = document.createElement('button');
  confirmButton.classList.add('btn', 'btn-warning', 'float-end');
  confirmButton.innerText = 'Confirm';
  confirmButton.addEventListener('click', surrenderConfirmAction);
  surrenderDiv.appendChild(confirmButton);

  messageScreen.appendChild(surrenderDiv);
};

battleSurrenderButton.addEventListener('click', surrenderMessageOverlay);

const fightConfirmAction = async (moveId, pokemonData) => {
  const room = await roomCheck();
  const { id } = room.data;
  const result = await axios.post(`/battles/fight/${id}`, { moveId, pokemonData });
  if (result.data) {
    await tabulateRound();
    socket.emit('advance-inner-gamestate', id);
  }
};

const fightMessageOverlay = async () => {
  clickAudio.play();
  const userBattleInfo = await battleJsonCheck();
  const { activePokemonIndex, pokemon } = userBattleInfo.data;
  const {
    move1, move2, move3, move4,
  } = pokemon[activePokemonIndex];

  const fightDiv = document.createElement('div');
  fightDiv.classList.add('overlayLargeMessage', 'row');

  const movesDiv = document.createElement('div');
  movesDiv.classList.add('col', 'd-flex', 'flex-column', 'justify-content-center', 'align-items-center');

  const movesFirstRow = document.createElement('div');
  movesFirstRow.classList.add('row', 'mb-3');
  const moveOneDiv = document.createElement('div');
  moveOneDiv.classList.add('col');
  const moveOneButton = document.createElement('button');
  moveOneButton.classList.add('btn', 'btn-danger', 'battleButton');
  moveOneButton.innerText = move1.moveName;
  moveOneDiv.appendChild(moveOneButton);
  const moveTwoDiv = document.createElement('div');
  moveTwoDiv.classList.add('col');
  const moveTwoButton = document.createElement('button');
  moveTwoButton.classList.add('btn', 'btn-danger', 'battleButton');
  moveTwoButton.innerText = move2.moveName;
  moveTwoDiv.appendChild(moveTwoButton);
  movesFirstRow.appendChild(moveOneDiv);
  movesFirstRow.appendChild(moveTwoDiv);
  movesDiv.appendChild(movesFirstRow);

  const movesSecondRow = document.createElement('div');
  movesSecondRow.classList.add('row');
  const moveThreeDiv = document.createElement('div');
  moveThreeDiv.classList.add('col');
  const moveThreeButton = document.createElement('button');
  moveThreeButton.classList.add('btn', 'btn-danger', 'battleButton');
  moveThreeButton.innerText = move3.moveName;
  moveThreeDiv.appendChild(moveThreeButton);
  const moveFourDiv = document.createElement('div');
  moveFourDiv.classList.add('col');
  const moveFourButton = document.createElement('button');
  moveFourButton.classList.add('btn', 'btn-danger', 'battleButton');
  moveFourButton.innerText = move4.moveName;
  moveFourDiv.appendChild(moveFourButton);
  movesSecondRow.appendChild(moveThreeDiv);
  movesSecondRow.appendChild(moveFourDiv);
  movesDiv.appendChild(movesSecondRow);

  const confirmDiv = document.createElement('div');
  confirmDiv.classList.add('col', 'd-flex', 'flex-column-reverse');

  const backDiv = document.createElement('div');
  backDiv.classList.add('row', 'p-3');
  const backButton = document.createElement('button');
  backButton.classList.add('btn', 'btn-secondary');
  backButton.innerText = 'Back';
  backButton.addEventListener('click', () => {
    clickAudio.play();
    fightDiv.remove();
  });
  backDiv.appendChild(backButton);

  const moveInfoDiv = document.createElement('div');
  moveInfoDiv.classList.add('row', 'px-3');
  const moveInfo = document.createElement('div');
  moveInfo.classList.add('col-8');
  moveInfo.innerHTML = '<h5>Select a move</h5>';
  moveInfoDiv.appendChild(moveInfo);

  const moveConfirm = document.createElement('div');
  moveConfirm.classList.add('col');
  moveInfoDiv.appendChild(moveConfirm);

  moveOneButton.addEventListener('click', () => {
    moveInfo.innerHTML = `Move Name: ${move1.moveName}</br>
    Type: ${move1.moveType} (${move1.moveCategory})</br>
    Power: ${move1.power} | PP Left: ${move1.pp}`;
    moveConfirm.innerHTML = '';
    if (move1.pp) {
      const moveConfirmButton = document.createElement('button');
      moveConfirmButton.classList.add('btn', 'btn-warning');
      moveConfirmButton.innerText = 'Confirm';
      moveConfirmButton.addEventListener('click', () => {
        clickAudio.play();
        fightConfirmAction('move1', pokemon[activePokemonIndex]);
        fightDiv.remove();
        waitingforActionGenerate();
      });
      moveConfirm.appendChild(moveConfirmButton);
    }
  });

  moveTwoButton.addEventListener('click', () => {
    moveInfo.innerHTML = `Move Name: ${move2.moveName}</br>
    Type: ${move2.moveType} (${move2.moveCategory})</br>
    Power: ${move2.power} | PP Left: ${move2.pp}`;
    moveConfirm.innerHTML = '';
    if (move2.pp) {
      const moveConfirmButton = document.createElement('button');
      moveConfirmButton.classList.add('btn', 'btn-warning');
      moveConfirmButton.innerText = 'Confirm';
      moveConfirmButton.addEventListener('click', () => {
        clickAudio.play();
        fightConfirmAction('move2', pokemon[activePokemonIndex]);
        fightDiv.remove();
        waitingforActionGenerate();
      });
      moveConfirm.appendChild(moveConfirmButton);
    }
  });

  moveThreeButton.addEventListener('click', () => {
    moveInfo.innerHTML = `Move Name: ${move3.moveName}</br>
    Type: ${move3.moveType} (${move3.moveCategory})</br>
    Power: ${move3.power} | PP Left: ${move3.pp}`;
    moveConfirm.innerHTML = '';
    if (move3.pp) {
      const moveConfirmButton = document.createElement('button');
      moveConfirmButton.classList.add('btn', 'btn-warning');
      moveConfirmButton.innerText = 'Confirm';
      moveConfirmButton.addEventListener('click', () => {
        clickAudio.play();
        fightConfirmAction('move3', pokemon[activePokemonIndex]);
        fightDiv.remove();
        waitingforActionGenerate();
      });
      moveConfirm.appendChild(moveConfirmButton);
    }
  });

  moveFourButton.addEventListener('click', () => {
    moveInfo.innerHTML = `Move Name: ${move4.moveName}</br>
    Type: ${move4.moveType} (${move4.moveCategory})</br>
    Power: ${move4.power} | PP Left: ${move4.pp}`;
    moveConfirm.innerHTML = '';
    if (move4.pp) {
      const moveConfirmButton = document.createElement('button');
      moveConfirmButton.classList.add('btn', 'btn-warning');
      moveConfirmButton.innerText = 'Confirm';
      moveConfirmButton.addEventListener('click', () => {
        clickAudio.play();
        fightConfirmAction('move4', pokemon[activePokemonIndex]);
        fightDiv.remove();
        waitingforActionGenerate();
      });
      moveConfirm.appendChild(moveConfirmButton);
    }
  });

  confirmDiv.appendChild(backDiv);
  confirmDiv.appendChild(moveInfoDiv);

  fightDiv.appendChild(movesDiv);
  fightDiv.appendChild(confirmDiv);
  messageScreen.appendChild(fightDiv);
};

battleFightButton.addEventListener('click', fightMessageOverlay);

const loginCheck = async () => {
  const result = await axios.get('/users/loginCheck');
  if (result.data) {
    const loginRoomCheck = await roomCheck();
    if (loginRoomCheck.data) {
      socket.emit('join-socket', loginRoomCheck.data.id);
      if (loginRoomCheck.data.gameState.state === 'battle') {
        battleScreen.style.display = 'block';
        populateBattleScreen();
      }
      else if (loginRoomCheck.data.gameState.state === 'loadout') {
        loadoutScreen.style.display = 'block';
        populateLoadoutPokemonButtons();
      } else if (loginRoomCheck.data.gameState.state === 'room') {
        roomScreen.style.display = 'block';
        populateRoom();
      }
      loginScreen.style.display = 'none';
      lobbyScreen.style.display = 'none';
    } else {
      socket.emit('join-lobby');
      lobbyScreen.style.display = 'block';
      roomScreen.style.display = 'none';
      loginScreen.style.display = 'none';
      populateLobbyScreen();
    }
  } else {
    lobbyScreen.style.display = 'none';
    loginScreen.style.display = 'block';
  }
};
loginCheck();

lobbyLogOutButton.addEventListener('click', async () => {
  clickAudio.play();
  const result = await axios.get('/users/logout');
  if (result) {
    loginCheck();
  }
});

loginButton.addEventListener('click', async () => {
  const data = {
    email: loginEmail.value,
    password: loginPassword.value,
  };
  const result = await axios.post('/users/login', data);
  if (!result.data) {
    loginError.innerText = 'Invalid Email Address / Password entered. Please try again!';
    return;
  }
  clickAudio.play();
  loginEmail.value = '';
  loginPassword.value = '';
  loginError.innerText = '';
  loginCheck();
});

roomBackButton.addEventListener('click', async () => {
  clickAudio.play();
  const result = await roomCheck();

  const { id, primary, secondary } = result.data;
  const leaveResult = await axios.post('/rooms/leave', { id, primary, secondary });
  loginCheck();

  if (leaveResult.data.leaveRoom) {
    socket.emit('refreshRoom', id);
  } else if (leaveResult.data.deleteRoom) {
    socket.emit('refreshGame', id);
    socket.emit('update-game-list');
  }
  socket.emit('leave-socket', id);
  socket.emit('join-lobby');
});

// Socket.io components
socket.on('enableStartButton', async () => {
  populateRoom();
});

socket.on('refreshRoom', () => {
  populateRoom();
});

socket.on('update-game-list', () => {
  populateLobbyScreen();
});

socket.on('room-ready', () => {
  advanceToLoadout();
  populateLoadoutPokemonButtons();
});

socket.on('loadout-ready', () => {
  advanceToBattle();
});

socket.on('advance-inner-gamestate', () => {
  const waitingForResponseMessage = document.getElementById('waitingForAction');
  if (waitingForResponseMessage) {
    waitingForResponseMessage.remove();
  }
  populateBattleScreen();
});

socket.on('refreshGame', () => {
  loginCheck();
});
