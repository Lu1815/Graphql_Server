import { ApolloServer, UserInputError, gql } from 'apollo-server';
import { v1 as uuid } from 'uuid';

const personas = [
    {
        name:"Luis Felipe",
        street:"Managua",
        city:"Managua",
        id:'123456789',
    },
    {
        name:"Angelica",
        street:"Managua",
        city:"Managua",
        id:'987654321',
    },
    {
        name:"LUFC",
        street:"Managua",
        city:"Managua",
        id:'123456',
    },
]

const typeDefs = gql`
    enum YesNo {
        YES
        NO
    }

    type Address {
        street: String!
        city: String!
    }

    type Person {
        name: String!
        phone: String
        address: Address!
        id: ID!
    }

    type Query {
        personCount: Int!
        allPersons(phone: YesNo): [Person]!
        findPerson(name: String!): Person        
    }

    type Mutation {
        addPerson(
            name: String!
            phone: String
            street: String!
            city: String!
        ): Person,
        editNumber(
            name: String!
            phone: String!
        ): Person,
    }
`
const resolvers = {
    Query: {
        personCount: () => personas.length,
        allPersons: (root, args) => {
            if(!args.phone) return personas

            const byPhone = person => 
            args.phone === "YES" ? person.phone : !person.phone;

            return personas.filter(byPhone);
        },
        findPerson: (root, args) => {
            const {name} = args;
            return personas.find(persona => persona.name = name);
        }
    },
    Mutation: {
        addPerson: (root, args) => {
            if(persona.find(p => p.name === args.name)){
                throw new UserInputError('Name must be unique', {
                    invalidArgs: args.name
                })
            }

            const person = {...args, id: uuid()};
            personas.push(person);
            return person;
        },
        editNumber: (root, args) => {
            const personIndex = personas.findIndex(persona => persona.name = args.name);
            if(personIndex === -1) return null

            const person = personas[personIndex];
            
            const updatedPerson = { ...person, phone: args.phone }
            personas[personIndex] = updatedPerson;

            return updatedPerson;
        }
    },
    Person: {
        address: (root) => {
            return {
                street: root.street,
                city: root.city
            }
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen().then(({url}) => {
    console.log(`Server ready at ${url}`)
})