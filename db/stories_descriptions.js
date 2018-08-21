module.exports = function(sequelize, db) {

  const s = sequelize.define("stories_descriptions",
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
      story_id: db.INTEGER,
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
