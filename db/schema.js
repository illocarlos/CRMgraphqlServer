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

   #MODEL TYPE!!!!!

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

type Product{
    id:ID   
name:String
stock:Int
price:Float
create:String
}



   #INPUT!!!!

input UserInput{
name:String!
surnames:String!
email:String!
age:Int!
password:String!
}

input ProductInput{
name:String!
stock:Int!
price:Float!
}

input AutenticateInput{
    email:String!
    password:String!
}

   #QUERY/MUTATION!!!!!

type Query{
    #dame usuario su info
    getUser(token:String!):User

    #dame product su info
       getProduct:[Product]
           getProductId(id:ID!):Product

}

type Mutation{
    #usuario
  createUser(input:UserInput):User
    autenticateUser(input:AutenticateInput):Token

    #productos
      createProduct(input:ProductInput):Product
      updateProduct(id:ID!,input:ProductInput):Product
         deletedProduct(id:ID!):String
}

    `;

module.exports = typeDefs;
