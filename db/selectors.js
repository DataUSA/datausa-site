module.exports = function(sequelize, db) {

  const s = sequelize.define("selectors",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      options: db.ARRAY(db.TEXT),
      default: db.TEXT,
      topic_id: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
