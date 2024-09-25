//authServer to show the authentification process on port 5000
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

//Refresh token to have an exparation date else they would have access forever with one token
//Also invalidating it with logout route
//Main Reason: Invalidate users that shouldnt have access and have two different servers (One espacially for auth)

let refreshTokens = []

//to create a brand new access token if the old one is expired in my case it expires after one minute
// POST http://localhost:5000/token 
app.post('/token', (req, res) => {
    //get the refresh token and check it
    const refreshToken = req.body.token;

    //If the refresh is null or doesnt include the token a err will be thrown
    if(refreshToken === null) return res.sendStatus(401);

    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403)

    //checl the refresh token with the secret key
    jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err)  return res.sendStatus(403)
        const accessToken = generateAccessToken({name: user.name})
        res.json({accessToken: accessToken})
    })
})

// POST http://localhost:5000/login
app.post('/login', (req, res) => {
    const username = req.body.username;
    const user = {name: username}

    //Generates access for the user
    const accessToken = generateAccessToken(user);

    //generates refresh token for the access token and safes it in a list (best practise would be to safe those in a database not a list)
    const refreshToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    refreshTokens.push(refreshToken)
    res.json({accessToken: accessToken, refreshToken: refreshToken});

})

//To delete the refresh token so the user doesnt have access for as long as he hase the refresh token
app.delete('/logout', (req, res) => {
    //Filters the refresh token from the list to make it invalid
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

function generateAccessToken(user) {
    //expires to see expire the token
    return accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1m'});
}



app.listen(5000)