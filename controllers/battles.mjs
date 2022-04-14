/* eslint-disable max-len */
const randomAtkPercentage = () => ((25 + Math.floor(Math.random() * 21)) / 100);
const randomChance = (factor) => {
  const randomDraw = Math.floor(Math.random() * 100) + 1;
  if (randomDraw <= factor) {
    return 1;
  }
  return 0;
};

export default function initBattlesController(db) {
  const show = async (request, response) => {
    try {
      const { id } = request.params;
      const { user } = request.cookies;
      const result = await db.Room.findOne({
        where: {
          id,
        },
      });
      response.send(result.gameState[user]);
    } catch (error) {
      response.status(500).send();
    }
  };

  const fight = async (request, response) => {
    try {
      const { id } = request.params;
      const { user } = request.cookies;
      const room = await db.Room.findOne({
        where: {
          id,
        },
      });
      const { primaryUser, secondaryUser, gameState } = room;
      const users = [primaryUser, secondaryUser];
      const userId = Number(user);
      users.splice(users.indexOf(userId), 1);
      const opponentId = users[0];

      request.body.action = 'fight';

      gameState[user].waitingForResponse = true;
      gameState[user].response = request.body;
      await db.Room.update({
        gameState,
      }, {
        where: {
          id,
        },
      });
      if (gameState[userId].waitingForResponse && gameState[opponentId].waitingForResponse) {
        response.send(true);
      } else {
        response.send(false);
      }
    } catch (error) {
      response.status(500).send();
    }
  };

  const pokemon = async (request, response) => {
    try {
      const { id } = request.params;
      const { user } = request.cookies;
      const room = await db.Room.findOne({
        where: {
          id,
        },
      });
      const { primaryUser, secondaryUser, gameState } = room;
      const users = [primaryUser, secondaryUser];
      const userId = Number(user);
      users.splice(users.indexOf(userId), 1);
      const opponentId = users[0];

      request.body.action = 'pokemon';
      gameState[user].waitingForResponse = true;
      gameState[user].response = request.body;
      gameState[user].requireChangePokemon = false;
      await db.Room.update({
        gameState,
      }, {
        where: {
          id,
        },
      });
      if (gameState[userId].waitingForResponse && gameState[opponentId].waitingForResponse) {
        response.send(true);
      } else {
        response.send(false);
      }
    } catch (error) {
      response.status(500).send();
    }
  };

  const calculateDamage = async (attackingPokemon, attackingMove, defendingPokemon) => {
    const messages = [];
    messages.push(`${attackingPokemon.pokemonName} used ${attackingMove.moveName}!`);

    let typeMultiplier = 1;
    let criticalHit = 0;

    let ratioAD = 0;
    if (attackingMove.moveCategory === 'Physical') {
      ratioAD = attackingPokemon.attack / defendingPokemon.defense;
    } else if (attackingMove.moveCategory === 'Special') {
      ratioAD = attackingPokemon.spAttack / defendingPokemon.spDefense;
    }

    const accuracyHit = randomChance(attackingMove.accuracy);
    if (!accuracyHit) {
      messages.push('It missed!');
    } else {
      const typeEffectiveness = await db.Type.findOne({
        where: {
          typeName: attackingMove.moveType,
        },
      });
      const { strongAgainst, weakAgainst, noEffect } = typeEffectiveness;

      if (strongAgainst) {
        if (strongAgainst.includes(defendingPokemon.pokemonType)) {
          typeMultiplier = 2;
          messages.push('It was super effective!');
        }
      }

      if (weakAgainst) {
        if (weakAgainst.includes(defendingPokemon.pokemonType)) {
          typeMultiplier = 0.5;
          messages.push('It was not very effective!');
        }
      }

      if (noEffect) {
        if (noEffect.includes(defendingPokemon.pokemonType)) {
          typeMultiplier = 0;
          messages.push('It had no effect on the opponent!');
        }
      }

      const criticalChance = randomChance(5);
      if (criticalChance === 1) {
        criticalHit = 1.5;
        messages.push('A critical hit!');
      } else {
        criticalHit = 1;
      }
    }

    // eslint-disable-next-line max-len
    const damage = Math.floor(attackingMove.power * ratioAD * typeMultiplier * accuracyHit * randomAtkPercentage() * criticalHit);
    return {
      damage,
      messages,
    };
  };

  const generateTotalHp = (gameState) => {
    let counter = 0;
    gameState.pokemon.forEach((x) => {
      counter += x.currentHp;
    });
    return counter;
  };

  const tabulateRound = async (request, response) => {
    try {
      const { id } = request.params;
      const messageContainer = [];

      const room = await db.Room.findOne({
        where: {
          id,
        },
      });
      const { primaryUser, secondaryUser, gameState } = room;
      let primaryAction;
      if (gameState[primaryUser].response) {
        primaryAction = gameState[primaryUser].response.action;
      }
      let secondaryAction;
      if (gameState[secondaryUser].response) {
        secondaryAction = gameState[secondaryUser].response.action;
      }

      const userActions = [primaryAction, secondaryAction];
      const playerGameStates = [gameState[primaryUser], gameState[secondaryUser]];

      gameState[primaryUser].waitingForResponse = false;
      gameState[secondaryUser].waitingForResponse = false;

      for (let i = 0; i < userActions.length; i += 1) {
        if (userActions[i] === 'pokemon') {
          const { fromPokemon, toPokemon } = playerGameStates[i].response;
          messageContainer.push(`${fromPokemon} has been swapped with ${toPokemon}!`);
          playerGameStates[i].activePokemonIndex = playerGameStates[i].response.toPokemonIndex;
          delete playerGameStates[i].response;
        }
      }
      const primaryActivePokemon = playerGameStates[0].pokemon[playerGameStates[0].activePokemonIndex];
      const secondaryActivePokemon = playerGameStates[1].pokemon[playerGameStates[1].activePokemonIndex];

      if (userActions[0] === 'fight' && userActions[1] === 'fight') {
        const primaryPokemon = gameState[primaryUser].response.pokemonData;
        const primaryMove = gameState[primaryUser].response.moveId;
        const secondaryPokemon = gameState[secondaryUser].response.pokemonData;
        const secondaryMove = gameState[secondaryUser].response.moveId;

        let order;
        if (primaryPokemon.speed >= secondaryPokemon.speed) {
          order = [[primaryPokemon, primaryPokemon[primaryMove], secondaryPokemon, secondaryActivePokemon, gameState[primaryUser], gameState[secondaryUser], primaryActivePokemon[primaryMove]],
            [secondaryPokemon, secondaryPokemon[secondaryMove], primaryPokemon, primaryActivePokemon, gameState[secondaryUser], gameState[primaryUser], secondaryActivePokemon[secondaryMove]]];
        } else if (secondaryPokemon.speed > primaryPokemon.speed) {
          order = [[secondaryPokemon, secondaryPokemon[secondaryMove], primaryPokemon, primaryActivePokemon, gameState[secondaryUser], gameState[primaryUser], secondaryActivePokemon[secondaryMove]],
            [primaryPokemon, primaryPokemon[primaryMove], secondaryPokemon, secondaryActivePokemon, gameState[primaryUser], gameState[secondaryUser], primaryActivePokemon[primaryMove]]];
        }

        for (let i = 0; i < order.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
          const resultInfo = await calculateDamage(
            order[i][0],
            order[i][1],
            order[i][2],
          );
          order[i][3].currentHp -= resultInfo.damage;
          order[i][6].pp -= 1;
          resultInfo.messages.forEach((x) => {
            messageContainer.push(x);
          });
          delete order[i][4].response;
          if (order[i][3].currentHp <= 0) {
            order[i][3].currentHp = 0;
            messageContainer.push(`${order[i][3].pokemonName} has fainted!`);
            order[i][4].waitingForResponse = true;
            order[i][5].requireChangePokemon = true;
            break;
          }
        }
      } else {
        for (let i = 0; i < userActions.length; i += 1) {
          if (userActions[i] === 'fight') {
            let defendingActivePokemon = secondaryActivePokemon;
            let gameStateAttackingUser = gameState[primaryUser];
            let gameStateDefendingUser = gameState[secondaryUser];
            if (i === 1) {
              defendingActivePokemon = primaryActivePokemon;
              gameStateAttackingUser = gameState[secondaryUser];
              gameStateDefendingUser = gameState[primaryUser];
            }
            const { moveId, pokemonData } = playerGameStates[i].response;
            // eslint-disable-next-line no-await-in-loop
            const resultInfo = await calculateDamage(pokemonData, pokemonData[moveId], defendingActivePokemon);
            defendingActivePokemon.currentHp -= resultInfo.damage;
            resultInfo.messages.forEach((x) => {
              messageContainer.push(x);
            });
            delete gameStateAttackingUser.response;
            if (defendingActivePokemon.currentHp < 0) {
              defendingActivePokemon.currentHp = 0;
              messageContainer.push(`${defendingActivePokemon.pokemonName} has fainted!`);
              gameStateAttackingUser.waitingForResponse = true;
              gameStateDefendingUser.requireChangePokemon = true;
              break;
            }
          }
        }
      }
      gameState.messages = messageContainer;

      gameState.winner = '';
      const primaryUserTotalHp = generateTotalHp(playerGameStates[0]);
      const secondaryUserTotalHp = generateTotalHp(playerGameStates[1]);

      if (!primaryUserTotalHp || !secondaryUserTotalHp) {
        const primary = await db.User.findOne({
          where: {
            id: primaryUser,
          },
        });
        const secondary = await db.User.findOne({
          where: {
            id: secondaryUser,
          },
        });
        const primaryTotalGames = primary.totalGames + 1;
        const secondaryTotalGames = secondary.totalGames + 1;
        await db.User.update({
          totalGames: primaryTotalGames,
        }, {
          where: {
            id: primaryUser,
          },
        });
        await db.User.update({
          totalGames: secondaryTotalGames,
        }, {
          where: {
            id: secondaryUser,
          },
        });
        if (!primaryUserTotalHp) {
          gameState.winner = `${secondary.displayName} wins!`;
          const wonGames = secondary.wonGames + 1;
          await db.User.update({
            wonGames,
          }, {
            where: {
              id: secondaryUser,
            },
          });
        } else if (!secondaryUserTotalHp) {
          gameState.winner = `${primary.displayName} wins!`;
          const wonGames = primary.wonGames + 1;
          await db.User.update({
            wonGames,
          }, {
            where: {
              id: primaryUser,
            },
          });
        }
      }

      await db.Room.update({
        gameState,
      }, {
        where: {
          id,
        },
      });

      response.send(true);
    } catch (error) {
      response.status(500).send();
    }
  };

  const resetLobby = async (request, response) => {
    try {
      const { id } = request.params;
      const room = await db.Room.findOne({
        where: {
          id,
        },
      });
      if (room) {
        await db.Room.destroy({
          where: {
            id,
          },
        });
      }
      response.send(true);
    } catch (error) {
      response.status(500).send();
    }
  };

  const surrender = async (request, response) => {
    try {
      const { id } = request.params;
      const { user } = request.cookies;
      const room = await db.Room.findOne({
        where: {
          id,
        },
      });
      const { primaryUser, secondaryUser, gameState } = room;
      const users = [primaryUser, secondaryUser];
      const userId = Number(user);
      users.splice(users.indexOf(userId), 1);
      const opponentId = users[0];

      const win = await db.User.findOne({
        where: {
          id: opponentId,
        },
      });
      const lose = await db.User.findOne({
        where: {
          id: userId,
        },
      });

      const opponentWonGames = win.wonGames + 1;
      const opponentTotalGames = win.totalGames + 1;
      const userTotalGames = lose.totalGames + 1;

      await db.User.update({
        totalGames: opponentTotalGames,
        wonGames: opponentWonGames,
      }, {
        where: {
          id: opponentId,
        },
      });

      await db.User.update({
        totalGames: userTotalGames,
      }, {
        where: {
          id: userId,
        },
      });

      gameState.winner = `${lose.displayName} has surrendered. ${win.displayName} wins!`;
      await db.Room.update({
        gameState,
      }, {
        where: {
          id,
        },
      });
      response.send(true);
    } catch (error) {
      response.status(500).send();
    }
  };

  return {
    show, fight, pokemon, tabulateRound, resetLobby, surrender,
  };
}
