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
      type: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  t.associate = models => {
    t.hasMany(models.visualizations, {foreignKey: "owner_id", sourceKey: "id", as: "visualizations"});
    t.hasMany(models.stats, {foreignKey: "owner_id", sourceKey: "id", as: "stats"});
  };

  return t;

};
