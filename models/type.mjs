export default function typeModel(sequelize, DataTypes) {
  return sequelize.define('type', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    typeName: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    strongAgainst: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    weakAgainst: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    noEffect: {
      type: DataTypes.ARRAY(DataTypes.STRING),
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
