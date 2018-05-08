module.exports = function(sequelize, db) {

  const v = sequelize.define("visualizations_topics",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      logic: db.TEXT,
      topic_id: db.INTEGER,
      allowed: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return v;

};
