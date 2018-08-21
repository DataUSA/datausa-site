module.exports = function(sequelize, db) {

  const t = sequelize.define("topics_subtitles",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
      },      
      topic_id: db.INTEGER,
      allowed: {
        type: db.STRING,
        defaultValue: "always"
      }, 
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return t;

};
