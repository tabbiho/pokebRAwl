export default function moveModel(sequelize, DataTypes) {
  return sequelize.define('move', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    moveName: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    moveType: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    moveCategory: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    power: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    accuracy: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    pp: {
      allowNull: false,
      type: DataTypes.INTEGER,
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
