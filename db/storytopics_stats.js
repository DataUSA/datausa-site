module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopics_stats",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: db.TEXT,
      subtitle: db.TEXT,
      value: db.TEXT,
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
