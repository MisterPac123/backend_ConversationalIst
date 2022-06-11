//Signup
const usersTable = myDb.collection('Users')


const express = require('express')
const router = express.Router()


router.post('/signup', (req, res) =>{
            
    const newUser = {
        id : ObjectId(),
        email: req.body.email,
        name: req.body.name,
        username: req.body.username,
        password: req.body.password
    }

    console.log("signup")

    const query = { email: newUser.email }

    usersTable.findOne(query, (err, result) => {

        if(result == null){
    console.log("signup sucess")
            usersTable.insertOne(newUser, (err, result) =>{
                res.status(200).send()
            })
        } else {
    console.log("signup failed")
            res.status(400).send()
        }
    })

})

//Login
router.post('/login', (req, res) =>{

    const query = { username: req.body.username,
                    password: req.body.password,}

console.log("Login")

    usersTable.findOne(query, (err, result) => {

        if (result != null) {

            const objToSend = {
                name: result.name,
                email: result.email,
                username: result.username
            }
            
    console.log("Login success")
            res.status(200).send(JSON.stringify(objToSend))

        } else {
    console.log("Login fail")
            res.status(404).send()
        }

    })

})

module.exports = router