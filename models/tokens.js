'use strict';
module.exports = (sequelize, DataTypes) => {
  const tokens = sequelize.define('tokens', {
    google: DataTypes.TEXT,
    mm: DataTypes.STRING,
    user_id: DataTypes.STRING
  }, {});
  tokens.associate = function(models) {
    // associations can be defined here
  };
  return tokens;
};