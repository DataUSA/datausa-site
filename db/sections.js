module.exports = function(sequelize, db) {

  const s = sequelize.define("sections",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: db.STRING,
      slug: db.STRING,
      profile_id: db.INTEGER,
      ordering: db.INTEGER,
      allowed: db.STRING
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
