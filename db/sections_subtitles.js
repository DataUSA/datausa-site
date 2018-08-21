module.exports = function(sequelize, db) {

  const s = sequelize.define("sections_subtitles",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
      },        
      section_id: db.INTEGER,
      allowed: {
        type: db.STRING,
        defaultValue: "always"
      },  
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
