module.exports = function(sequelize, db) {

  const g = sequelize.define("generators",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: db.TEXT,
        defaultValue: "New Generator"
      },
      api: {
        type: db.TEXT,
        defaultValue: "http://api-goes-here"
      },
      description: {
        type: db.TEXT,
        defaultValue: "New Description"
      },
      logic: {
        type: db.TEXT,
        defaultValue: "return {}"
      },
      profile_id: db.INTEGER
    },
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return g;

};
