export default function userModel(sequelize, DataTypes) {
  return sequelize.define('user', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    displayName: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    userSpriteId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: 'user_sprites',
        key: 'id',
      },
    },
    totalGames: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    wonGames: {
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
