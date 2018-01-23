module.exports = function(sequelize, db) {

  const v = sequelize.define("visualizations",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      logic: db.TEXT,
      owner_type: db.STRING,
      owner_id: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return v;

};
