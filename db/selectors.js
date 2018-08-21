module.exports = function(sequelize, db) {

  const s = sequelize.define("selectors",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      options: {
        type: db.ARRAY(db.JSON),
        defaultValue: []
      },
      default: {
        type: db.TEXT,
        defaultValue: ""
      },          
      topic_id: db.INTEGER,
      name: {
        type: db.STRING,
        defaultValue: "newselector"
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
