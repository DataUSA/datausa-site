module.exports = function(sequelize, db) {

  const m = sequelize.define("materializers",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: db.STRING,
      description: db.TEXT,
      logic: db.TEXT,
      ordering: db.INTEGER,
      profile_id: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return m;

};
