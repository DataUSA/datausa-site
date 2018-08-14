module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopics",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: db.STRING,
      slug: db.STRING,
      story_id: db.INTEGER,
      type: db.STRING,
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  s.associate = models => {
    s.hasMany(models.storytopics_descriptions, {foreignKey: "storytopic_id", sourceKey: "id", as: "descriptions"});
    s.hasMany(models.storytopics_stats, {foreignKey: "storytopic_id", sourceKey: "id", as: "stats"});
    s.hasMany(models.storytopics_subtitles, {foreignKey: "storytopic_id", sourceKey: "id", as: "subtitles"});
    s.hasMany(models.storytopics_visualizations, {foreignKey: "storytopic_id", sourceKey: "id", as: "visualizations"});
  };  

  return s;

};
