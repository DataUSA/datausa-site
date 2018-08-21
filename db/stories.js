module.exports = function(sequelize, db) {

  const s = sequelize.define("stories",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Story"
      },       
      image: {
        type: db.STRING,
        defaultValue: "New Image"
      }, 
      ordering: db.INTEGER,
      slug: {
        type: db.STRING,
        defaultValue: "new-story-slug"
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  s.associate = models => {
    // s.belongsToMany(models.authors, {through: "stories_authors", foreignKey: "story_id", otherKey: "author_id", as: "authors"});
    s.hasMany(models.authors, {foreignKey: "story_id", sourceKey: "id", as: "authors"});
    s.hasMany(models.stories_footnotes, {foreignKey: "story_id", sourceKey: "id", as: "footnotes"});
    s.hasMany(models.stories_descriptions, {foreignKey: "story_id", sourceKey: "id", as: "descriptions"});
    s.hasMany(models.storytopics, {foreignKey: "story_id", sourceKey: "id", as: "storytopics"});
  };  

  return s;

};
