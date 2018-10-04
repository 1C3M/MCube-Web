'use strict';
module.exports = (sequelize, DataTypes) => {
  const images = sequelize.define('images', {
    filename: DataTypes.STRING,
    user_id: DataTypes.STRING
  }, {});
  images.associate = function(models) {
    // associations can be defined here
  };
  return images;
};