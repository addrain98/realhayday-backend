const knex = require('knex')({
    client: 'mysql',
    connection: {
      user: 'foo',
      password:'bar',
      database:'JScatalogue',
      host:'127.0.0.1'
    }
  })
  const bookshelf = require('bookshelf')(knex)
  
  module.exports = bookshelf;