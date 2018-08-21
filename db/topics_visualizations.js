module.exports = function(sequelize, db) {

  const v = sequelize.define("topics_visualizations",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      logic: {
        type: db.TEXT,
        defaultValue: "return {}"
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

  return v;

};
