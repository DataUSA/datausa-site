module.exports = function(sequelize, db) {

  const p = sequelize.define("profiles",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: db.STRING,
      description: db.TEXT,
      subtitle: db.TEXT,
      slug: db.STRING,
      ordering: db.INTEGER,
      label: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  p.associate = models => {
    p.hasMany(models.sections, {foreignKey: "profile_id", sourceKey: "id", as: "sections"});
    p.hasMany(models.visualizations_profiles, {foreignKey: "profile_id", sourceKey: "id", as: "visualizations"});
    p.hasMany(models.stats_profiles, {foreignKey: "profile_id", sourceKey: "id", as: "stats"});
    p.hasMany(models.profiles_descriptions, {foreignKey: "profile_id", sourceKey: "id", as: "descriptions"});
    p.hasMany(models.generators, {foreignKey: "profile_id", sourceKey: "id", as: "generators"});
    p.hasMany(models.materializers, {foreignKey: "profile_id", sourceKey: "id", as: "materializers"});
  };

  return p;

};
