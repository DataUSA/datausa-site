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

  return s;

};
