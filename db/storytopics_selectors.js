module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopics_selectors",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      default: db.TEXT,
      storytopic_id: db.INTEGER,
      name: db.STRING,
      options: db.ARRAY(db.JSON),
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
