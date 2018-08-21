module.exports = function(sequelize, db) {

  const s = sequelize.define("sections",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Section"
      },      
      slug: {
        type: db.STRING,
        defaultValue: "new-section-slug"
      },
      profile_id: db.INTEGER,
      ordering: db.INTEGER,
      allowed: {
        type: db.STRING,
        defaultValue: "always"
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  s.associate = models => {
    s.hasMany(models.topics, {foreignKey: "section_id", sourceKey: "id", as: "topics"});
    s.hasMany(models.sections_subtitles, {foreignKey: "section_id", sourceKey: "id", as: "subtitles"});
    s.hasMany(models.sections_descriptions, {foreignKey: "section_id", sourceKey: "id", as: "descriptions"});
  };

  return s;

};
