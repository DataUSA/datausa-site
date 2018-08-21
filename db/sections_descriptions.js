module.exports = function(sequelize, db) {

  const s = sequelize.define("sections_descriptions",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      description: {
        type: db.TEXT,
        defaultValue: "New Description"
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
