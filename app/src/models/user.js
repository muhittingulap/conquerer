'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Blog, {as: 'blogs'}),
      User.hasMany(models.Session, {as: 'sessions'})
    }
  }
  User.init({
    full_name: DataTypes.STRING,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    birthday:DataTypes.STRING
  }, {
    sequelize,
    paranoid: true,
    modelName: 'User',
  });
  return User;
};