module.exports = function(sequelize, db) {

  const s = sequelize.define("selectors",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      options: db.ARRAY(db.JSON),
      default: db.TEXT,
      topic_id: db.INTEGER,
      name: db.STRING
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
