module.exports = function(sequelize, db) {

  const s = sequelize.define("topics_stats",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Stat"
      },
      subtitle: {
        type: db.STRING,
        defaultValue: "New Subtitle"
      },      
      value: {
        type: db.STRING,
        defaultValue: "New Value"
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

  return s;

};
