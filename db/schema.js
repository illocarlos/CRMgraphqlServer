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
create:String
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
type Client{
    id:ID   
name:String
surnames:String
email:String
phone:String
company:String
create:String
seller:ID
}


type Order{
    id:ID  
    order :[OrderGroup]
    total:String
    state:String
    create:String
    client:ID
seller:ID

}
type OrderGroup{
    id:ID
    name:String
    price:Float
    cuantity:Int
}

type TopClient{
    total:Float
  client:[Client]
}

type TopSeller{
    total:Float
    seller:[User]
}
   #INPUT!!!!

input UserInput{
name:String!
surnames:String!
email:String!
password:String!
}

input ProductInput{
name:String!
stock:Int!
price:Float!
}

#le pasamos el esquema de cliente pero no le pasamos el seller como aparece en el modelo
#por que se la pasamos via context en resolvers es una de las pocas cosas en la que se usa context 

input ClientInput{
name:String!
surnames:String!
email:String!
company:String!
phone:String

}

# Principio input Order 


input OrderInput{
order:[OrderProductInput]
total:String
client:ID
state:StateOrder
}

input OrderProductInput{
    id:ID
    name:String
    price:Float
    cuantity:Int
}

#ESTE ENUM ES CE GRAPHQL ES LA FORMA DE CONECTAR UN INPUT CON OTRO 
#EN ESTE CASO QUEREMOS DAR A UN ESTADO TRES OPCIONES QUE SOLO SE PUEDAN ELEGIR UNA DE ESAS TRES 
enum StateOrder{
   EARRING 
   COMPLETE
   CANCEL
}


# fin Order
input AutenticateInput{
    email:String!
    password:String!
}

   #QUERY/MUTATION!!!!!

type Query{
    #dame usuario su info
    getUser:User

    #QUERY PRODUCT
    #todo los producto
       getProduct:[Product]

       #dame solo uno
           getProductId(id:ID!):Product

               #QUERY CLIENT
               #dame todo client su info
                 getClients:[Client]
                 #dame los clientes de cada vendedor
                       getClientsSeller:[Client]
                          #dame solo un clientes 
                       getOnlyClient(id:ID!):Client

                       #QUERY ORDER
                             getOrders:[Order]
                             getOrdersPerSeller:[Order]
                              getOrderId(id:ID!):Order
                              getOrderState(state:String!):[Order]!

#Filtros avanzados
getTopClients:[TopClient]
getTopSellers:[TopSeller]
searchProduct(text:String!):[Product]
searchClient(text:String!):[Client]
searchSeller(text:String!):[User]


}

type Mutation{

    #usuario
  createUser(input:UserInput):User
    autenticateUser(input:AutenticateInput):Token

    #productos
      createProduct(input:ProductInput):Product
      updateProduct(id:ID!,input:ProductInput):Product
         deletedProduct(id:ID!):String

         #Cliente
               createClient(input:ClientInput):Client
                     updateClient(id:ID!,input:ClientInput):Client
                        deletedClient(id:ID!):String

                   #Pedidos
                                  createOrder(input:OrderInput):Order
                                  updateOrder(id:ID!,input:OrderInput):Order
                                             deletedOrder(id:ID!):String

                
}


    `;

module.exports = typeDefs;
