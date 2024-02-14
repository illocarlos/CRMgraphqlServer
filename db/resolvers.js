
// resolver
const resolvers = {

    Query: {
        // se le pasa 4 argumentos el primero es para hacer cosultas anidadas en graphql se pone guin bajo para ignorarlo
        //el segundo es el argumento que queremos pasarle para que haga la llamada le pusimos input por que es como lo llamamos en shema
        //el tercer argumentos se conoce como un context es un objeto que se comparte con todos los resolver y se pasa informacion de atenticacion
        //el 4 argumentos se conoce como info es el ma avanzado lo quito para que no genere ningun tipo de error
        //se suelen usar el segundo y tercero normalmente pero es para que sepas que existen
        getCourse: () => "eeeeeiiiiii"

    }
}
module.exports = resolvers;