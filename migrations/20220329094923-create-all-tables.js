module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_sprites', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sprite: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      display_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      user_sprite_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'user_sprites',
          key: 'id',
        },
      },
      total_games: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      won_games: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('types', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      strong_against: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      weak_against: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      no_effect: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('moves', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      move_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      move_type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      move_category: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      power: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      accuracy: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      pp: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('pokemons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      pokemon_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      pokemon_type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      hp: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      attack: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      defense: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      sp_attack: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      sp_defense: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      speed: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      move_one: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'moves',
          key: 'id',
        },
      },
      move_two: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'moves',
          key: 'id',
        },
      },
      move_three: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'moves',
          key: 'id',
        },
      },
      move_four: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'moves',
          key: 'id',
        },
      },
      small_sprite: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      front_sprite: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      back_sprite: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      pokedex_sprite: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('rooms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      primary_user: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      secondary_user: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      game_state: {
        allowNull: false,
        type: Sequelize.JSON,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('rooms');
    await queryInterface.dropTable('pokemons');
    await queryInterface.dropTable('moves');
    await queryInterface.dropTable('types');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('user_sprites');
  },
};
