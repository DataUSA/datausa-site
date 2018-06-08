module.exports = function(sequelize, db) {

  const s = sequelize.define("sections_descriptions",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      description: db.TEXT,
      section_id: db.INTEGER,
      allowed: db.STRING,
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
