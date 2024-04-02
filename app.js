const express = require('express')
const app = express()
app.use(express.json())

const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db') //dbPath is given as arguument to filename in open() obect which connects database and server

const {open} = require('sqlite') //{open} method connect database server and provieds connection object to operate database
const sqlite3 = require('sqlite3')

let db = null //********************************************************//

const initializeDBAndServer = async () => {
  try {
    db = await open({
      //on resolve promise object , we will get database connection object, db is used to store this obj
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const hasPirority = requestQuery => {
  return requestQuery.priority !== undefined
}
const hasPirorityAndStatus = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}
const hasStatus = requestQuery => {
  return requestQuery.status !== undefined
}

//1. GET a list of all todos whose status is 'TO DO'

app.get('/todos/', async (request, response) => {
  const {search_q = '', priority, status} = request.query
  let data = null
  let getTodoQuery = ''
  switch (true) {
    case hasPirorityAndStatus(request.query):
      getTodoQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`

      break
    case hasPirority(request.query):
      getTodoQuery = `SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatus(request.query):
      getTodoQuery = `SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    default:
      getTodoQuery = `SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }
  data = await db.all(getTodoQuery)
  response.send(data)
})

//2. GET a specific todo based on the todo ID

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getIdQuery = `
  SELECT * FROM todo WHERE id = ${todoId};`
  const todoByID = await db.get(getIdQuery)
  response.send(todoByID)
})

//3. GET a todo in the todo table

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const addValQuery = `
  INSERT INTO todo (id, todo, priority, status) VALUES (${id}, '${todo}', '${priority}', '${status}');`
  await db.run(addValQuery)
  response.send('Todo Successfully Added')
})

//4. Updates the details of a specific todo based on the todo ID

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getPreviousTodo = `SELECT * FROM todo WHERE id = ${todoId};`
  const {todo, priority, status} = request.body
  let getQuery = ''
  switch (true) {
    case todo !== undefined:
      getQuery = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`
      await db.run(getQuery)
      response.send('Todo Updated')
      break
    case status !== undefined:
      getQuery = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};`
      await db.run(getQuery)
      response.send('Status Updated')
      break
    case priority !== undefined:
      getQuery = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`
      await db.run(getQuery)
      response.send('Priority Updated')
      break
  }
})

//5. DELETE a todo from the todo table based on the todo ID

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQuery = `
  DELETE FROM todo WHERE id = ${todoId};`
  await db.run(deleteQuery)
  response.send('Todo Deleted')
})

module.exports = app
