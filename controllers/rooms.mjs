import sequelizePackage from 'sequelize';

const { Op } = sequelizePackage;

export default function initRoomsController(db) {
  const index = async (request, response) => {
    try {
      const result = await db.Room.findAll({
        include: {
          as: 'primary',
          model: db.User,
        },
      });
      response.send(result);
    } catch (error) {
      response.status(500).send();
    }
  };

  const create = async (request, response) => {
    try {
      const { user } = request.cookies;
      const result = await db.Room.create({
        primaryUser: user,
        gameState: { state: 'room' },
      });
      response.send(result);
    } catch (error) {
      response.status(500).send();
    }
  };

  const show = async (request, response) => {
    try {
      const { user } = request.cookies;
      const result = await db.Room.findOne({
        where: {
          [Op.or]: [{ primaryUser: user }, { secondaryUser: user }],
        },
        include: [{
          as: 'primary',
          model: db.User,
          include: {
            model: db.UserSprite,
          },
        },
        {
          as: 'secondary',
          model: db.User,
          include: {
            model: db.UserSprite,
          },
        }],
      });
      if (result) {
        if (result.gameState.readyPlayer === user) {
          result.dataValues.isPlayerReady = true;
        }
      }
      response.send(result);
    } catch (error) {
      response.status(500).send();
    }
  };

  const join = async (request, response) => {
    try {
      const { id } = request.body;
      const { user } = request.cookies;
      const result = await db.Room.update({
        secondaryUser: user,
      }, {
        where: { id },
      });
      response.send(result);
    } catch (error) {
      response.status(500).send();
    }
  };

  const leave = async (request, response) => {
    try {
      const { id, primary, secondary } = request.body;
      const { user } = request.cookies;
      let deleteRoom;
      let leaveRoom;
      if (Number(user) === primary.id) {
        deleteRoom = await db.Room.destroy({
          where: {
            id,
          },
        });
      } else if (Number(user) === secondary.id) {
        leaveRoom = await db.Room.update({
          gameState: { state: 'room' },
          secondaryUser: null,
        }, {
          where: {
            id,
          },
        });
      }
      response.send({ deleteRoom, leaveRoom });
    } catch (error) {
      response.status(500).send();
    }
  };

  const playerReady = async (request, response) => {
    try {
      const { id } = request.params;
      const { user } = request.cookies;
      const result = await db.Room.update({
        gameState: {
          state: 'room',
          playerReady: true,
          readyPlayer: user,
        },
      }, {
        where: {
          id,
        },
      });
      response.send(result);
    } catch (error) {
      response.status(500).send();
    }
  };

  const advanceToLoadout = async (request, response) => {
    try {
      const { id } = request.params;
      const result = await db.Room.update({
        gameState: {
          state: 'loadout',
        },
      }, {
        where: {
          id,
        },
      });
      response.send(result);
    } catch (error) {
      response.status(500).send();
    }
  };

  const loadoutReady = async (request, response) => {
    try {
      const { user } = request.cookies;
      const { id } = request.params;
      const userPokemon = [];
      const room = await db.Room.findOne({
        where: {
          id,
        },
      });
      const { primaryUser, secondaryUser, gameState } = room;
      request.body.forEach((x) => {
        const currentPokemon = {};
        currentPokemon.pokemonName = x.data.pokemonName;
        currentPokemon.pokemonType = x.data.pokemonType;
        currentPokemon.currentHp = x.data.hp;
        currentPokemon.maxHp = x.data.hp;
        currentPokemon.attack = x.data.attack;
        currentPokemon.defense = x.data.defense;
        currentPokemon.spAttack = x.data.spAttack;
        currentPokemon.spDefense = x.data.spDefense;
        currentPokemon.speed = x.data.speed;
        currentPokemon.frontSprite = x.data.frontSprite;
        currentPokemon.backSprite = x.data.backSprite;
        currentPokemon.smallSprite = x.data.smallSprite;
        currentPokemon.move1 = x.data.move1;
        currentPokemon.move2 = x.data.move2;
        currentPokemon.move3 = x.data.move3;
        currentPokemon.move4 = x.data.move4;
        userPokemon.push(currentPokemon);
      });

      gameState[user] = { activePokemonIndex: 0, pokemon: userPokemon };
      if (gameState[primaryUser] && gameState[secondaryUser]) {
        gameState.state = 'battle';
      }
      await db.Room.update({
        gameState,
      }, {
        where: {
          id,
        },
      });
      if (gameState[primaryUser] && gameState[secondaryUser]) {
        response.send(true);
      }
    } catch (error) {
      response.status(500).send();
    }
  };

  return {
    index,
    create,
    show,
    join,
    leave,
    playerReady,
    advanceToLoadout,
    loadoutReady,
  };
}
