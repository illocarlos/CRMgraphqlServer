const { gql } = require('apollo-server')


// schema
//QUERY/ MUTATION
//requieres un type y resolver para que se ejecute sino da error
//los query son para hacer una consulta a la base de dato(metodo get) es decir recoger informacionde una api por ejemplo
//es un select en base de dato
// normalmente se usar mas mutation que query ya que el mutation se usa para editar borrar y crear en base de dato 
//es en si el CRUD completo sin recibir la info que se usar los query
//si usamos type query y mutation tanto aqui como en el archivo resolvers deben tener las mismas funciones y si es wuery o mutation


//Esquema Mutation y query
//llamamos la accion que tenemos en el resolver o que vamos a crear ya que es lo que conecta la funcion o accion 
//con el squema y de segundo declaramos con el modelo por ejemplo en token llamamos atenticateToken
// ya que en el resolver lo  llamamos igual y ahi va la logica pero en este caso lo nombramos con token ya que es lo que vamos a pasarle

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

type Token{
token:String
}


input UserInput{
name:String!
surnames:String!
email:String!
age:Int!
password:String!
}

input AutenticateInput{
    email:String!
    password:String!
}


type Query{
    getUser(token:String!):User

}

type Mutation{
    

  createUser(input:UserInput):User

    autenticateUser(input:AutenticateInput):Token

}

    `;

module.exports = typeDefs;
