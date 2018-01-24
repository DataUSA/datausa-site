module.exports = function(sequelize, db) {

  const g = sequelize.define("generators",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: db.STRING,
      api: db.STRING,
      description: db.TEXT,
      logic: db.TEXT,
      profile_id: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return g;

};
