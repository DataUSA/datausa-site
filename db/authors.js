module.exports = function(sequelize, db) {

  const a = sequelize.define("authors",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: db.STRING,
      title: db.STRING,
      image: db.STRING,
      twitter: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return a;

};
