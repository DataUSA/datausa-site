module.exports = function(sequelize, db) {

  const s = sequelize.define("stats_topics",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: db.STRING,
      subtitle: db.STRING,
      value: db.STRING,
      topic_id: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
