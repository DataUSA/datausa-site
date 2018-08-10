module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopics_visualizations",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      logic: db.TEXT,
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
