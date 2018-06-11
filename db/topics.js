module.exports = function(sequelize, db) {

  const t = sequelize.define("topics",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: db.STRING,
      subtitle: db.STRING,
      slug: db.STRING,
      description: db.TEXT,
      section_id: db.INTEGER, 
      type: db.STRING,
      ordering: db.INTEGER,
      allowed: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  t.associate = models => {
    t.hasMany(models.visualizations_topics, {foreignKey: "topic_id", sourceKey: "id", as: "visualizations"});
    t.hasMany(models.stats_topics, {foreignKey: "topic_id", sourceKey: "id", as: "stats"});
    t.hasMany(models.topics_subtitles, {foreignKey: "topic_id", sourceKey: "id", as: "subtitles"});
    t.hasMany(models.topics_descriptions, {foreignKey: "topic_id", sourceKey: "id", as: "descriptions"});
    t.hasMany(models.selectors, {foreignKey: "topic_id", sourceKey: "id", as: "selectors"});
  };

  return t;

};
