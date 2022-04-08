import { Sequelize } from 'sequelize';
import allConfig from '../config/config.js';

import userSpriteModel from './userSprite.mjs';
import userModel from './user.mjs';
import pokemonModel from './pokemon.mjs';
import moveModel from './move.mjs';
import typeModel from './type.mjs';
import roomModel from './room.mjs';

const env = process.env.NODE_ENV || 'development';

const config = allConfig[env];

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

// add your model definitions to db here
db.UserSprite = userSpriteModel(sequelize, Sequelize.DataTypes);
db.User = userModel(sequelize, Sequelize.DataTypes);
db.Pokemon = pokemonModel(sequelize, Sequelize.DataTypes);
db.Move = moveModel(sequelize, Sequelize.DataTypes);
db.Type = typeModel(sequelize, Sequelize.DataTypes);
db.Room = roomModel(sequelize, Sequelize.DataTypes);

db.User.belongsTo(db.UserSprite);
db.UserSprite.hasMany(db.User);

db.Pokemon.belongsTo(db.Move, {
  as: 'move1',
  foreignKey: 'moveOne',
});
db.Move.hasMany(db.Pokemon, {
  foreignKey: 'moveOne',
});
db.Pokemon.belongsTo(db.Move, {
  as: 'move2',
  foreignKey: 'moveTwo',
});
db.Move.hasMany(db.Pokemon, {
  foreignKey: 'moveTwo',
});
db.Pokemon.belongsTo(db.Move, {
  as: 'move3',
  foreignKey: 'moveThree',
});
db.Move.hasMany(db.Pokemon, {
  foreignKey: 'moveThree',
});
db.Pokemon.belongsTo(db.Move, {
  as: 'move4',
  foreignKey: 'moveFour',
});
db.Move.hasMany(db.Pokemon, {
  foreignKey: 'moveFour',
});

db.User.hasMany(db.Room, {
  as: 'primary',
  foreignKey: 'primaryUser',
});
db.Room.belongsTo(db.User, {
  as: 'primary',
  foreignKey: 'primaryUser',
});

db.User.hasMany(db.Room, {
  as: 'secondary',
  foreignKey: 'secondaryUser',
});
db.Room.belongsTo(db.User, {
  as: 'secondary',
  foreignKey: 'secondaryUser',
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
