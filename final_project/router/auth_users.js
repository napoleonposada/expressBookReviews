const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let userswithsamename = users.filter((user)=>{
        return user.username === username;
    });
    if(userswithsamename.length>0){
        return true;
    }else{
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password);
    });
    if(validusers.length>0){
        return true;
    }else{
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    return res.status(404).json({message:"Error logging in."});
  }
  if(authenticatedUser(username,password)){
    let accessToken=jwt.sign({
        data: password
    },'access',{expiresIn: 60*60});
    req.session.authorization  = {
        accessToken, username
    }
    return res.status(200).send("User successfully logged in.");
  }else{
    return res.status(208).json({message:"Invalid login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    const comment = req.body.comment;
    let reviews = books[isbn].reviews;
    let review ={};

    console.log(comment);
    console.log(username);
    console.log(reviews);
    console.log(reviews.length);

    // 1 Check for a valid comment
    if(comment){
        // 2 Check if there are existing comments
        if(reviews.length>0){
            for(let i=0; i<reviews.length; i++){
                console.log(i+" "+ JSON.stringify(reviews[i]));
                if(reviews[i].reviewer===username){
                    if(reviews[i].comment!==comment){
                        reviews[i].reviewer=username;
                        reviews[i].comment=comment;
                        console.log(username + " "+comment);
                        res.send(JSON.stringify(reviews));
                        break;
                    }
                }else{
                    review.reviewer=username;
                    review.comment=comment;
                    reviews.push(review);
                    res.send(JSON.stringify(reviews));
                    break;
                }
            }
        }else{
            // First comment
            console.log("first review " + username + "-"+comment);
            review.reviewer=username;
            review.comment=comment;
            reviews.push(review);
            res.send(JSON.stringify(reviews));
        }
    }else{
        res.status(404).json({message:"Invalid or null comment."});
    }
    console.log("end of PUT command");
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
