const { gql } = require('apollo-server')


// schema
//QUERY/ MUTATION
//requieres un type y resolver para que se ejecute sino da error
//los query son para hacer una consulta a la base de dato(metodo get) es decir recoger informacionde una api por ejemplo
//es un select en base de dato
// normalmente se usar mas mutation que query ya que el mutation se usa para editar borrar y crear en base de dato 
//es en si el CRUD completo sin recibir la info que se usar los query
//si usamos type query y mutation tanto aqui como en el archivo resolvers deben tener las mismas funciones y si es wuery o mutation

//USERINPUT
//es lo que le pasamos al mutation para la creacion
//el signo de exclamacion es para definir que es obligatorio
//
const typeDefs = gql`

type User{
    id:ID   
name:String
surnames:String
email:String
age:Int
create:String
NID:String
}

input UserInput{
name:String!
surnames:String!
email:String!
age:Int!
password:String!
}

type Query{
    
    getCourse:String

}

type Mutation{
    
  createUser(input:UserInput):User

}

    `;

module.exports = typeDefs;
