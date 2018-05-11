module.exports = function(sequelize, db) {

  const t = sequelize.define("topics_subtitles",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      subtitle: db.TEXT,
      topic_id: db.INTEGER,
      allowed: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return t;

};
