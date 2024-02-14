const { gql } = require('apollo-server')


// schema
//requieres un type y resolver para que se ejecute sino da error
const typeDefs = gql`
type Query{
    
    getCourse:String

}

    `;

module.exports = typeDefs;
