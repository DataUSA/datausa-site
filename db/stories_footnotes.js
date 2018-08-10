module.exports = function(sequelize, db) {

  const s = sequelize.define("stories_footnotes",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      description: db.TEXT,
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
