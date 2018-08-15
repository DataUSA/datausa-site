module.exports = function(sequelize, db) {

  const a = sequelize.define("authors",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: db.STRING,
      title: db.STRING,
      image: db.STRING,
      twitter: db.STRING,
      story_id: db.INTEGER,
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  a.associate = models => {
    a.hasMany(models.authors_descriptions, {foreignKey: "author_id", sourceKey: "id", as: "descriptions"});
  };  

  return a;

};
