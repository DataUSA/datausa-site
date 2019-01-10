module.exports = function(sequelize, db) {

  const t = sequelize.define("topics",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Topic"
      },
      slug: {
        type: db.STRING,
        defaultValue: "new-topic-slug"
      },
      section_id: db.INTEGER,
      type: {
        type: db.STRING,
        defaultValue: "TextViz"
      },
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

  t.associate = models => {
    t.belongsTo(models.sections, {foreignKey: "section_id", sourceKey: "id", as: "section"});
    t.hasMany(models.topics_visualizations, {foreignKey: "topic_id", sourceKey: "id", as: "visualizations"});
    t.hasMany(models.topics_stats, {foreignKey: "topic_id", sourceKey: "id", as: "stats"});
    t.hasMany(models.topics_subtitles, {foreignKey: "topic_id", sourceKey: "id", as: "subtitles"});
    t.hasMany(models.topics_descriptions, {foreignKey: "topic_id", sourceKey: "id", as: "descriptions"});
    t.hasMany(models.selectors, {foreignKey: "topic_id", sourceKey: "id", as: "selectors"});
  };

  return t;

};
