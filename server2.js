//Server2 to show that the authToken works through different servers one on port 3000 and the other one on port 4000
require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

app.use(express.json())

const posts = [
    {
        username: 'Kyle',
        title: 'Post 1'
    },
    {
        username: 'Jim',
        title: 'Post 2'
    }
]

app.get('/post', authenticateToken, (req, res) => {
    //Filter to only get the posts of jim and kyle
    res.json(posts.filter(post => post.username === req.user.name));
})

app.post('/login', (req, res) => {
    //Authentificate the user 
        //Authentificate the username
    const username = req.body.username;
    const user = {name: username}

    //Create json web token:
        //sign() to serialize the payload
        //process.env is for the Secret key
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

    res.json({accessToken: accessToken});

})

function authenticateToken(req, res, next) {
    //function to autheticate
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if(token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        req.user = user;
        next()

    })
}

app.listen(4000)