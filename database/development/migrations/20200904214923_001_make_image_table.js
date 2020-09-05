
exports.up = function(knex) {
    return knex.schema.createTable('images', (tbl) => {
        tbl.increments();
        tbl.string("imgKey", 50).notNullable().unique();
        tbl.string("category", 50).notNullable();
        tbl.string("owner", 50).notNullable();
        tbl.string("description", 300).notNullable();
        tbl.boolean( "verified").defaultTo(false)
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('images');
  };
