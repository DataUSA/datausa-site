module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopics_descriptions",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      description: {
        type: db.TEXT,
        defaultValue: "New Description"
      },
      storytopic_id: db.INTEGER,
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
