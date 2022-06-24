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
        const usersTable = myDb.collection('Users')
        const publicChatRoomsTable = myDb.collection('PublicChatRooms') 
        const geoChatRoomTable = myDb.collection('GeoChatRooms') 
        const privateChatRoomTable = myDb.collection('PrivateChatRooms')

        //myDb.dropDatabase();

        function distance(lat1, lat2, lon1, lon2) {

            console.log(lat1 + " " + lat2 + " " + lon1 + " " + lon2)
            // The math module contains a function
            // named toRadians which converts from
            // degrees to radians.
            lon1 =  lon1 * Math.PI / 180;
            lon2 = lon2 * Math.PI / 180;
            lat1 = lat1 * Math.PI / 180;
            lat2 = lat2 * Math.PI / 180;
        
            // Haversine formula
            let dlon = lon2 - lon1;
            let dlat = lat2 - lat1;
            let a = Math.pow(Math.sin(dlat / 2), 2)
            + Math.cos(lat1) * Math.cos(lat2)
            * Math.pow(Math.sin(dlon / 2),2);
        
            let c = 2 * Math.asin(Math.sqrt(a));
        
            // Radius of earth in kilometers. Use 3956
            // for miles
            let r = 6371;
        
            // calculate the result
            return(c * r);
        }

        


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

        //new PublicChatRoom

        app.post('/chatRooms/NewChatRoom', (req, res) => {

            const newChatRoom = {
                id : ObjectId(),
                name: req.body.name,
                description: req.body.description,
                type: req.body.type,
                admin : req.body.admin,
                users:[req.body.admin],
                inviteLink: req.body.inviteLink,
                msgs:[],
                lastMsgTime: new Date(),
                
            }
            console.log(req.body.description)

            const query = { name: newChatRoom.name }

            publicChatRoomsTable.findOne(query, (err, result) => {

                if(result == null){
		            console.log("New Room Added")
                    publicChatRoomsTable.insertOne(newChatRoom, (err, result) =>{
                        res.status(200).send()
                    })
                } else {
		    console.log("new chat failed (name already exists")
                    res.status(400).send()
                }
            })
        })


        //new GeoChatRoom

        app.post('/chatRooms/NewGeoChatRoom', (req, res) => {

            const newGeoChatRoom = {
                id : ObjectId(),
                name: req.body.name,
                description: req.body.description,
                type: req.body.type,
                latitude: Number(req.body.latitude),
                longitude: Number(req.body.longitude),
                radius:Number(req.body.radius),
                admin : req.body.admin,
                users:[req.body.admin],
                msgs:[],
                lastMsgTime:new Date(),
            }

            const query = { name: newGeoChatRoom.name }

            console.log("create GeoRoom")


            geoChatRoomTable.findOne(query, (err, result) => {

                if(result == null){
		            console.log("geo chat added")
                    geoChatRoomTable.insertOne(newGeoChatRoom, (err, result) =>{
                        res.status(200).send()
                    })
                } else {
		            console.log("add geo chats failed")
                    res.status(400).send()
                }
            })
        })

        app.post('/chatRooms/NewPrivateChatRoom', (req, res) => {

            const newChatRoom = {
                id : ObjectId(),
                name: req.body.name,
                description: req.body.description,
                type: req.body.type,
                admin : req.body.admin,
                users:[req.body.admin],
                inviteLink: req.body.inviteLink,
                msgs:[],
                lastMsgTime: new Date(),
                
            }
            console.log(req.body.description)

            const query = { name: newChatRoom.name }

            privateChatRoomTable.findOne(query, (err, result) => {

                if(result == null){
		            console.log("New private Room Added")
                    privateChatRoomTable.insertOne(newChatRoom, (err, result) =>{
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

            publicChatRoomsTable.find(query).toArray(function(err, result) {
                if (err) throw err;
                console.log(result)
                res.status(200).send(JSON.stringify(result))
            })

        })

        app.post('/chatRooms/getUserChatRooms', (req, res) =>{

            console.log("get user ChatRoom")
            var query = { users: req.body.username };

            publicChatRoomsTable.find(query).toArray(function(err, result) {
                if (err) throw err;
                res.status(200).send(JSON.stringify(result))
            })

        })

        app.post('/chatRooms/getUserPrivateChatRooms', (req, res) =>{

            console.log("get user ChatRoom")
            var query = { users: req.body.username };

            privateChatRoomTable.find(query).toArray(function(err, result) {
                if (err) throw err;
                res.status(200).send(JSON.stringify(result))
            })

        })

        app.post('/chatRooms/getUserGeoChatRooms', (req, res) =>{
            var latitude1 = Number(req.body.latitude)
            var longitude1 = Number(req.body.longitude)

            console.log("get user geo ChatRoom")
            
            geoChatRoomTable.find( { $where: 
                function() { 
                    return this.radius <= distance(latitude1, this.latitude, longitude1, this.longitude) 
                }
            }).toArray(function(err, result) {
                if (err) throw err;
                res.status(200).send(JSON.stringify(result))
            })

        })

        app.post('/chatRooms/addUserToChatRoom', (req, res) =>{

            console.log("add user to ChatRoom")

            publicChatRoomsTable.findOne(query ,(err, result) => {

                if(result == null){
                    console.log("chat not found")
                    res.status(400).send()
                } else {
                    console.log("user added. sending chatroom to user")
                    res.status(200).send(JSON.stringify(result))
                }
            })

            publicChatRoomsTable.updateOne(
                {"name" :  req.body.chatName},
                { $push: {"users" : req.body.username} }
            )

            var query = {name: req.body.chatName}

        })


        app.post('/chatRooms/addUserToPrivateChatRoom', (req, res) =>{

            console.log("add user to private ChatRoom")

            privateChatRoomTable.findOne(query ,(err, result) => {

                if(result == null){
                    console.log("chat not found")
                    res.status(400).send()
                } else {
                    console.log("user added. sending chatroom to user")
                    res.status(200).send(JSON.stringify(result))
                }
            })

            privateChatRoomTable.updateOne(
                {"name" :  req.body.chatName},
                { $push: {"users" : req.body.username} }
            )

            var query = {name: req.body.chatName}

        })

        app.post('/chatRooms/sendMsgToChatRoom', (req, res) =>{

            console.log("send msg to ChatRoom")

            var chatTable;
            const query = {name: req.body.chatName}

            var msg = {
                id: ObjectId(),
                sender: req.body.user,
                msg: req.body.msg,
                date: new Date(),
                usersRead: [req.body.user]
            }

            var chatType = req.body.chatType
            switch(chatType){
                case 'Public':
                    chatTable = publicChatRoomsTable;
                    break;
                
                case 'Private':
                    chatTable = privateChatRoomTable
                    break;

                case 'Geo-fenced':
                    chatTable = geoChatRoomTable;
                    break;


                default:
                    console.log(chatType + " : case not found");
                    return
            }


            chatTable.updateOne(
                {"name" : req.body.chatName},
                {
                    $push: {"msgs": msg},
                    $set: {"lastMsgTime": msg.date}
                }
            )
            
            chatTable.findOne(query, (err, result) => {
                if(result == null){
                    
                    console.log("chat not found")
                    res.status(400).send()
                } else {
                    console.log("msg pushed")
                    res.status(200).send(JSON.stringify(msg))
                }
            })
        })


        app.post('/chatRooms/readMsg', (req, res) => {
            console.log("read msg")
            console.log(req.body.msgId)
            console.log(req.body.username)
            var chatTable;

            var chatType = req.body.chatType
            switch(chatType){
                case 'Public':
                    chatTable = publicChatRoomsTable;
                    break;
                
                case 'Private':
                    chatTable = privateChatRoomTable
                    break;

                case 'Geo-fenced':
                    chatTable = geoChatRoomTable;
                    break;
            }

            var query = {"name" :  req.body.chatName, "msgs": {"$elemMatch":{"id": ObjectId(req.body.msgId), "usersRead": req.body.username}}};
            
            chatTable.findOne(query, (err, result) =>{

                console.log("this is query")
                if(result==null){
                    console.log("add user to usersRead")
                    chatTable.updateOne(
                        {"name" :  req.body.chatName, "msgs": {"$elemMatch":{"id": ObjectId(req.body.msgId)}}}, 
                        { $push: {"msgs.$.usersRead": req.body.username}}
                    )
                    res.status(200).send()
                }
                else{
                    console.log("user already added")
                    res.status(200).send()
                }
            })
        })

        app.post('/chatRooms/getMsgFromChatRoom', (req, res) =>{

            console.log("get msg from ChatRoom")

            var chatTable;
            const query = {name: req.body.chatName}
            const options = {
                sort: {"msgs.date" : -1},
                projection: {msgs : 1, _id: 0}
                
            }

            var chatType = req.body.chatType
            switch(chatType){
                case 'Public':
                    chatTable = publicChatRoomsTable;
                    break;
                
                case 'Private':
                    chatTable = privateChatRoomTable;
                    break;

                case 'Geo-fenced':
                    chatTable = geoChatRoomTable;
                    break;


                default:
                    console.log(chatType + " : case not found");
                    return
            }

            chatTable.findOne(query, options, (err, result) => {
                if(result == null){
                    console.log("chat not found")
                    res.status(400).send()
                }
                else{
                    res.status(200).send(JSON.stringify(result))
                }
            })
        })

        app.post('/chatRooms/addUserToPrivateChatRoom', (req, res) =>{

            console.log("add user to Private ChatRoom")
            console.log("inviteLink: " + req.body.inviteLink)
            console.log("username: " + req.body.username)
            //chatRooms dont exist TODO 
            chatRoomsTable.updateOne(
                {"inviteLink" :  req.body.inviteLink},
                { $push: {"users" : req.body.username} }
            )

            var query = {inviteLink: req.body.inviteLink}

            chatRoomsTable.findOne(query ,(err, result) => {

                if(result == null){
                    console.log("chat not found")
                    res.status(400).send()
                } else {
                    console.log("user added. sending chatroom to user")
                    res.status(200).send(JSON.stringify(result))
                }
            })
        })
    }
})

app.listen(3000, () => {
    console.log("Listening on port 3000...")
})

