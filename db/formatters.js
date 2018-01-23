module.exports = function(sequelize, db) {

  const f = sequelize.define("formatters",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: db.STRING,
      description: db.TEXT,
      logic: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return f;

};
