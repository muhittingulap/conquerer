'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Blog.hasMany(models.Comment, { as: 'comments' }),
        Blog.belongsTo(models.User, { foreignKey: 'UserId', as: 'user' })
      Blog.belongsTo(models.Category, { foreignKey: 'CategoryId', as: 'category' })
    }
  }
  Blog.init({
    title: DataTypes.STRING,
    content: DataTypes.TEXT
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Blog',
  });
  return Blog;
};