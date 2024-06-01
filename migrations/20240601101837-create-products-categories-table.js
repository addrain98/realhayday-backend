'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('products_categories', {
    id:{
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      unsigned:true
    },
    product_id:{
      type:'int',
      notNull:true,
      unsigned:true,
      foreignKey:{
        name: 'products_categories_product_fk',
        table:'products',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping:'id'
      }
    },
    category_id:{
      type:'int',
      notNull:true,
      unsigned:true,
      foreignKey:{
        name: 'products_categories_categories_fk',
        table:'categories',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping:'id'
      }
    }
  });
};

exports.down = function(db) {
  return db.dropTable('products_categories');
};

exports._meta = {
  "version": 1
};
