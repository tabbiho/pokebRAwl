import { resolve } from 'path';
import db from './models/index.mjs';
import initUsersController from './controllers/users.mjs';
import initPokemonsController from './controllers/pokemon.mjs';
import initRoomsController from './controllers/rooms.mjs';
import initBattlesController from './controllers/battles.mjs';

export default function bindRoutes(app) {
  const UsersController = initUsersController(db);
  const PokemonsController = initPokemonsController(db);
  const RoomsController = initRoomsController(db);
  const BattlesController = initBattlesController(db);

  app.get('/', (request, response) => {
    response.sendFile(resolve('dist', 'main.html'));
  });

  app.get('/users/sprite/:id', UsersController.getSprite);
  app.post('/users/create', UsersController.create);
  app.post('/users/login', UsersController.login);
  app.get('/users/loginCheck', UsersController.loginCheck);
  app.get('/users/getInfo', UsersController.getInfo);
  app.get('/users/logout', UsersController.logout);
  app.post('/users/getUserOpponentSprite', UsersController.getUserOpponentSprite);
  app.post('/users/emailCheck', UsersController.emailCheck);

  app.get('/pokemons/index', PokemonsController.index);
  app.get('/pokemons/show/:pokemonName', PokemonsController.show);

  app.get('/rooms/index', RoomsController.index);
  app.get('/rooms/create', RoomsController.create);
  app.get('/rooms/show', RoomsController.show);
  app.post('/rooms/join', RoomsController.join);
  app.post('/rooms/leave', RoomsController.leave);
  app.get('/rooms/playerReady/:id', RoomsController.playerReady);
  app.get('/rooms/advanceToLoadout/:id', RoomsController.advanceToLoadout);
  app.post('/rooms/loadoutReady/:id', RoomsController.loadoutReady);

  app.get('/battles/show/:id', BattlesController.show);
  app.post('/battles/fight/:id', BattlesController.fight);
  app.post('/battles/pokemon/:id', BattlesController.pokemon);
  app.get('/battles/tabulateRound/:id', BattlesController.tabulateRound);
  app.get('/battles/resetLobby/:id', BattlesController.resetLobby);
  app.get('/battles/surrender/:id', BattlesController.surrender);
}
