module.exports = function(sequelize, db) {

  const t = sequelize.define("topics_descriptions",
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
