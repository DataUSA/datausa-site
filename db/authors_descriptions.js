module.exports = function(sequelize, db) {

  const a = sequelize.define("authors_descriptions",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      description: db.TEXT,
      author_id: db.INTEGER,
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return a;

};
