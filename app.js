const express = require('express')
const { ObjectId } = require('mongodb')
const app = express()
const mongoClient = require('mongodb').MongoClient

const url = "mongodb://localhost:27017"

app.use(express.json())

//const userRouter = require('./routes.users')
//app.use('/users', userRouter)

mongoClient.connect(url, (err, db) => {

    if (err) {
        console.log("Error while connecting mongo client")
    } else {

        const myDb = db.db('myDb')
        const usersTable = myDb.collection('Users')
        const chatRoomsTable = myDb.collection('ChatRooms') 

        //myDb.dropDatabase();

        


        //Signup
        app.post('/users/signup', (req, res) =>{
            
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
        app.post('/users/login', (req, res) =>{

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

        //new ChatRoom

        app.post('/chatRooms/NewChatRoom', (req, res) => {

            const newChatRoom = {
                id : ObjectId(),
                name: req.body.name,
                description: req.body.description,
                type: req.body.type,
                admin : req.body.admin,
                users:[req.body.admin],
                msgs:[]
                
            }

            const query = { name: newChatRoom.name }

            chatRoomsTable.findOne(query, (err, result) => {

                if(result == null){
		            console.log("New Room Added")
                    console.log(newChatRoom.users)
                    console.log(req.body.admin)
                    chatRoomsTable.insertOne(newChatRoom, (err, result) =>{
                        res.status(200).send()
                    })
                } else {
		    console.log("new chat failed (name already exists")
                    res.status(400).send()
                }
            })
        })

            //search ChatRoom

        app.post('/chatRooms/searchChatRoom', (req, res) =>{

            console.log("search ChatRoom by name: " + req.body.chatName)
            var query = { name: new RegExp(req.body.chatName, 'i'), type: "Public"};

            chatRoomsTable.find(query).toArray(function(err, result) {
                if (err) throw err;
                console.log(result);
                res.status(200).send(JSON.stringify(result))
            })

        })

        app.post('/chatRooms/getUserChatRooms', (req, res) =>{

            console.log("get user ChatRoom")
            var query = { users: req.body.username };

            chatRoomsTable.find(query).toArray(function(err, result) {
                if (err) throw err;
                console.log(result);
                res.status(200).send(JSON.stringify(result))
            })

        })

        app.post('/chatRooms/addUserToChatRoom', (req, res) =>{

            console.log("add user to ChatRoom")

            chatRoomsTable.updateOne(
                {"name" :  req.body.chatName},
                { $push: {"users" : req.body.username} }
            )

            var query = {name: req.body.chatName}

            chatRoomsTable.findOne(query ,(err, result) => {

                if(result == null){
                    console.log("chat not found")
                    res.status(400).send()
                } else {
                    console.log("user added. sending chatroom to user")
                    //console.log(result);

                    res.status(200).send(JSON.stringify(result))
                }
            })
        })

        app.post('/chatRooms/sendMsgToChatRoom', (req, res) =>{

            console.log("send msg to ChatRoom")

            var msg = {
                sender: req.body.user,
                msg: req.body.msg,
                date: new Date(),
            }

            chatRoomsTable.updateOne(
                {"name" : req.body.chatName},
                {
                    $push: {"msgs": msg}
                }
            )

            var query = {name: req.body.chatName}

            chatRoomsTable.findOne(query ,(err, result) => {
                console.log(result)
            })

            res.status(200).send(JSON.stringify(msg))


        })

        app.post('/chatRooms/getMsgFromChatRoom', (req, res) =>{

            console.log("get msg from ChatRoom")

            const query = {name: req.body.chatName}
            const options = {
                sort: {"msgs.date" : -1},
                projection: {msgs : 1, _id: 0}
                
            }

            chatRoomsTable.findOne(query, options, (err, result) => {
                console.log(result)
                res.status(200).send(JSON.stringify(result))
            })

        })
    }


})

app.listen(3000, () => {
    console.log("Listening on port 3000...")
})