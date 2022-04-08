export default function initPokemonsController(db) {
  const index = async (request, response) => {
    try {
      const result = await db.Pokemon.findAll();
      response.send(result);
    } catch (error) {
      response.status(500).send();
    }
  };

  const show = async (request, response) => {
    try {
      const { pokemonName } = request.params;
      const result = await db.Pokemon.findOne({
        where: {
          pokemonName,
        },
        include: [{
          as: 'move1',
          model: db.Move,
        }, {
          as: 'move2',
          model: db.Move,
        }, {
          as: 'move3',
          model: db.Move,
        }, {
          as: 'move4',
          model: db.Move,
        },
        ],
      });
      response.send(result);
    } catch (error) {
      response.status(500).send();
    }
  };

  return {
    index, show,
  };
}
