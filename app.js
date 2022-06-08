const express = require('express')
const { ObjectId } = require('mongodb')
const app = express()
const mongoClient = require('mongodb').MongoClient

const url = "mongodb://localhost:27017"

app.use(express.json())

mongoClient.connect(url, (err, db) => {

    if (err) {
        console.log("Error while connecting mongo client")
    } else {

        const myDb = db.db('myDb')
        const usersTabble = myDb.collection('Users')
        const chatRoomsTable = myDb.collection('ChatRooms') 

        


        //Signup
        app.post('/signup', (req, res) =>{
            
            const newUser = {
                id : ObjectId(),
                email: req.body.email,
                name: req.body.name,
                username: req.body.username,
                password: req.body.password
            }

	    console.log("signup")

            const query = { email: newUser.email }

            usersTabble.findOne(query, (err, result) => {

                if(result == null){
		    console.log("signup sucess")
                    usersTabble.insertOne(newUser, (err, result) =>{
                        res.status(200).send()
                    })
                } else {
		    console.log("signup failed")
                    res.status(400).send()
                }
            })

        })
        
        //Login
        app.post('/login', (req, res) =>{

            const query = { username: req.body.username,
                            password: req.body.password,}

	    console.log("Login")

            usersTabble.findOne(query, (err, result) => {

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

        app.post('/NewChatRoom', (req, res) => {

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

        app.post('/searchChatRoom', (req, res) =>{

            console.log("search ChatRoom by name: " + req.body.chatName)
            var query = { name: new RegExp(req.body.chatName, 'i'), type: "Public"};

            chatRoomsTable.find(query).toArray(function(err, result) {
                if (err) throw err;
                console.log(result);
                res.status(200).send(JSON.stringify(result))
            })

        })

        app.post('/getUserChatRooms', (req, res) =>{

            console.log("get user ChatRoom")
            var query = { users: req.body.username };

            chatRoomsTable.find(query).toArray(function(err, result) {
                if (err) throw err;
                console.log(result);
                res.status(200).send(JSON.stringify(result))
            })

        })

        app.post('/addUserToChatRoom', (req, res) =>{

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
                    console.log(result);

                    res.status(200).send(JSON.stringify(result))
                }
            })
        })

        app.post('/sendMsgToChatRoom', (req, res) =>{

            console.log("send msg to ChatRoom")

            var _date = new Date();
            _date.setHours(req.body.Hours),
            _date.setMinutes(req.body.minutes),
            _date.setSeconds(req.body.Secounds),
            _date.setFullYear(req.body.year, req.body.month, req.body.date)

            var msg = {
                sender: req.body.sender,
                msg: req.body.msg,
                date: new Date(),
            }


            chatRoomsTable.updateOne(
                {"name" :  req.body.chatName},
                { $push: {"msgs.msg" : msg} }
            )
            res.status(200).send()

        })

        app.post('/getMsgFromChatRoom', (req, res) =>{

            console.log("receive msg to ChatRoom")

            if (req.body.time == '0'){
                chatRoomsTable.find().sort({date:-1})
            }

            var query = {name: req.body.chatName}

            chatRoomsTable.findOne(query ,(err, result) => {

                if(result == null){
                    console.log("chat not found")
                    res.status(400).send()
                } else {
                    console.log("user added. sending chatroom to user")
                    console.log(result);
                    var orderedMsgs = result.msgs.find().sort({date : -1})
                    console.log(orderedMsgs)
                    res.status(200).send(JSON.stringify(orderedMsgs))
                }
            })

        })
    }


})

app.listen(3000, () => {
    console.log("Listening on port 3000...")
})