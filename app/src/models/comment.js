'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Comment.belongsTo(models.User, { foreignKey: 'UserId', as: 'user' }),
      Comment.belongsTo(models.Blog, { foreignKey: 'BlogId', as: 'blogs' })
    }
  }
  Comment.init({
    content: DataTypes.TEXT
  }, {
    sequelize,
    paranoid: true,
    modelName: 'Comment',
  });
  return Comment;
};