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
      description: db.TEXT,
      profile_id: db.INTEGER,
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  s.associate = models => {
    s.hasMany(models.topics, {foreignKey: "section_id", sourceKey: "id", as: "topics"});
  };

  return s;

};
