module.exports = function(sequelize, db) {

  const v = sequelize.define("profiles_visualizations",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      logic: db.TEXT,
      profile_id: db.INTEGER,
      allowed: db.STRING,
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return v;

};
