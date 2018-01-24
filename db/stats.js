module.exports = function(sequelize, db) {

  const s = sequelize.define("stats",
    {
      /*id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },*/
      title: db.STRING,
      subtitle: db.STRING,
      value: db.STRING,
      owner_type: db.STRING,
      owner_id: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
