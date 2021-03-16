'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LoginHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  LoginHistory.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    auth_key: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'LoginHistory',
  });

  LoginHistory.associate = function (models) {
    LoginHistory.belongsTo(models.User, {as: 'user', foreignkey: 'user_id', targetkey:"user_id"})
  }
  return LoginHistory;
};