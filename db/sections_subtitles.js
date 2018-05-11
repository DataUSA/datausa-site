module.exports = function(sequelize, db) {

  const s = sequelize.define("sections_subtitles",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      subtitle: db.TEXT,
      section_id: db.INTEGER,
      allowed: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
