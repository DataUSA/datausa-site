module.exports = function(sequelize, db) {

  const p = sequelize.define("profiles",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: db.STRING,
      description: db.TEXT,
      introduction: db.TEXT,
      slug: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return p;

};
