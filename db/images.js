module.exports = function(sequelize, db) {

  const images = sequelize.define("images",
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: db.INTEGER
      },
      url: {
        type: db.TEXT,
        unique: true
      },
      author: db.TEXT,
      meta: db.TEXT,
      license: db.INTEGER
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return images;

};
