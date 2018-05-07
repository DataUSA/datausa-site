module.exports = function(sequelize, db) {

  const search = sequelize.define("search",
    {
      id: {
        primaryKey: true,
        type: db.TEXT
      },
      zvalue: db.DOUBLE,
      type: db.TEXT,
      name: db.TEXT,
      display: db.TEXT,
      sumlevel: db.TEXT,
      stem: db.INTEGER,
      slug: db.TEXT,
      keywords: db.ARRAY(db.TEXT),
      imageId: db.INTEGER
    },
    {
      freezeTableName: true,
      indexes: [
        {
          unique: true,
          fields: ["name", "id", "kind", "sumlevel"]
        }
      ],
      timestamps: false
    }
  );

  // CREATE EXTENSION pg_trgm;
  // CREATE INDEX search_on_name_idx ON search USING GIN(name gin_trgm_ops);
  // CREATE INDEX search_on_display_idx ON search USING GIN(display gin_trgm_ops);
  // CREATE INDEX search_on_keywords_idx ON search USING GIN(keywords);

  search.associate = models => {
    search.belongsTo(models.images);
  };

  return search;

};
