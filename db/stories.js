module.exports = function(sequelize, db) {

  const s = sequelize.define("stories",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: db.STRING,
      image: db.STRING,
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
