module.exports = function(sequelize, db) {

  const s = sequelize.define("profiles_stats",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: db.STRING,
      subtitle: db.STRING,
      value: db.STRING,
      profile_id: db.INTEGER,
      allowed: db.STRING,
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
