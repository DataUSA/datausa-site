module.exports = function(sequelize, db) {

  const t = sequelize.define("topics",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: db.STRING,
      subtitle: db.STRING,
      slug: db.STRING,
      description: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return t;

};
