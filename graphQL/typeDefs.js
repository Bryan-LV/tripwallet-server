const { gql } = require("apollo-server");

module.exports = gql`
  type Query {
    user(id: ID!): User
    users: [User]
    getTrip(id:ID!):Trip
    getTrips: [Trip]
    checkAuth: Response!
    getPhotos(query: String!, page: Int): PexelsResponse
  }

  type Mutation {
    register(registerUser: RegisterInput): User
    login(loginUser: LoginInput): User
    deleteUser(id:ID!): Response
    updateUser(updateUser: UpdateInput): User
    createTrip(createTrip: CreateTrip): Trip
    updateTrip(updateTrip:UpdateTrip): Trip
    deleteTrip(tripID:ID!): Response
    createExpense(newExpense: NewExpense): Expense
    updateExpense(updateExpense: UpdateExpense): Expense
    deleteExpense(expenseID: ID!): Response
  }

  type User {
    _id: ID!
    username: String!
    email:String!
    baseCurrency: String!
    createdAt:String!
    token: String
    trips: [Trip]
  }

  type Trip {
    _id: ID!
    user: ID!
    tripName: String!
    foreignCurrency: String!
    baseCurrency: String!
    budget: Int
    totalSpent: Float
    startDate: String!
    endDate: String
    photo: String
    categories: [String]
    expenses: [Expense]
  }

  type Expense {
    _id: ID!
    tripID: ID!
    category: String!,
    expenseName: String!
    foreignPrice: Float!
    baseCurrencyPrice: Float
    spread: Int
    startDate: String
    endDate: String
    notes: String
  }

  type PexelsResponse {
    total_results: Int
    page: Int
    per_page: Int
    next_page: String
    prev_page: String
    photos: [Photo]
  }

  type Photo {
    id: Int
    width: Int
    height: Int
    url: String
    photographer: String
    photographer_url: String
    photographer_id: Int
    src: PhotoSources
  }

  type PhotoSources {
    original: String
    large2x: String
    large: String
    medium: String
    small: String
    portrait: String
    landscape: String
    tiny: String
  }

  type Response {
    message: String!
    isValid: Boolean
  }

  input RegisterInput {
    username:String! 
    email: String!
    baseCurrency: String! 
    password: String! 
    confirmPassword: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateInput {
    id: ID!
    username: String
    email: String
    baseCurrency: String
    currentPassword: String 
    newPassword: String
    confirmNewPassword: String
  }

  input CreateTrip {
    tripName: String!
    foreignCurrency: String!
    baseCurrency: String!
    budget: Int
    startDate: String
    endDate: String
    photo: String
  }

  input UpdateTrip {
    tripID: ID!
    tripName: String
    foreignCurrency: String
    budget: Int
    startDate:String
    endDate: String
    photo: String
  }

  input NewExpense {
    tripID: ID!
    category: String
    expenseName: String
    foreignPrice: Float
    baseCurrencyPrice: Float
    spread: Int
    startDate:String
    endDate: String
    notes: String
  }

  input UpdateExpense {
    expenseID: ID!
    tripID: ID!
    category: String
    expenseName: String
    foreignPrice: Float
    baseCurrencyPrice: Float
    spread: Int
    startDate: String
    endDate: String
    notes: String
  }

`