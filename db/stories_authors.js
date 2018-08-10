module.exports = function(sequelize, db) {

  const s = sequelize.define("stories_authors",
    {
      story_id: db.INTEGER,
      author_id: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
