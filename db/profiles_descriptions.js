module.exports = function(sequelize, db) {

  const p = sequelize.define("profiles_descriptions",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      description: db.TEXT,
      profile_id: db.INTEGER,
      allowed: db.STRING,
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return p;

};
