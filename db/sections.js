module.exports = function(sequelize, db) {

  const s = sequelize.define("sections",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: db.STRING,
      slug: db.STRING,
      description: db.TEXT
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
