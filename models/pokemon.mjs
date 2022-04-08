export default function pokemonModel(sequelize, DataTypes) {
  return sequelize.define('pokemon', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    pokemonName: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    pokemonType: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    hp: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    attack: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    defense: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    spAttack: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    spDefense: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    speed: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    moveOne: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'moves',
        key: 'id',
      },
    },
    moveTwo: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'moves',
        key: 'id',
      },
    },
    moveThree: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'moves',
        key: 'id',
      },
    },
    moveFour: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'moves',
        key: 'id',
      },
    },
    smallSprite: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    frontSprite: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    backSprite: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    pokedexSprite: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    description: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  }, { underscored: true });
}
