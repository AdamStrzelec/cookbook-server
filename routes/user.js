const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');

const User = require('../models/user');
const Recipe = require('../models/recipe');

router.post('/signup', async (req, res, next) => {
    let emailExists = false;
    let nickExists = false;
    await User.find({ email: req.body.email })
    .exec()
    .then(user => {
        if(user.length >= 1){
            emailExists = true;
        }
        return emailExists;
    })
    await User.find({ nick: req.body.nick })
        .exec()
        .then(user => {
            if(user.length >= 1){
                nickExists = true;
            }
            return nickExists;
        })
    if(emailExists){
        return res.status(409).json({
            message: 'Użytkownik o takim adresie E-mail już istnieje'
        });
    }else if(nickExists){
        return res.status(409).json({
            message: 'Użytkownik o takim loginie już istnieje'
        });
    }else{
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if(err) {
                return res.status(500).json({
                    error: err
                });
            }else {
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    nick: req.body.nick,
                    email: req.body.email,
                    password: hash
                })
                user.save()
                .then(result => {
                    console.log(result);
                    res.status(201).json({
                        message: 'User created',
                        userId: user._id,
                    })
                    
                })
                .catch(err => {
                    console.log(err)
                    res.status(400).json({
                        message: err
                    })
                })
            }
        })
    }
});

router.post('/login', (req, res, next)=>{
    User.find({ nick: req.body.nick })
        .exec()
        .then( user => {
            if(user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if(err){
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if(result){
                    const token = jwt.sign({
                        userId: user[0]._id,
                        nick: user[0].nick
                    }, 
                    'secret',
                    {
                        expiresIn: '1h'
                    })
                    return res.status(200).json({
                        userName: user[0].nick,
                        userId: user[0]._id,
                        token: token
                    })
                }
                return res.status(401).json({
                    message: 'Auth failed'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});
router.post('/authenticate', checkAuth, (req, res, next) => {
    User.find({ _id: req.body.userId })
    .then( user => {
        if(user.length<1){
            return res.status(401).json({
                message: 'Auth failed xd'
            });
        }
        const token = jwt.sign({
            userId: user[0]._id,
            nick: user[0].nick
        }, 
        'secret',
        {
            expiresIn: '1h'
        })
        return res.status(200).json({
            message: 'auth succesfully',
            userName: user[0].nick,
            userId: user[0]._id,
            token: token
        })
    })
})

router.get('/info/:userId', checkAuth, async (req, res, next) => {
    console.log(req.params.userId)
    const userRecipes = await Recipe.find({ownerId: req.params.userId})
    .exec()
    .then(result => result)
    .catch(() => [])

    const userRecipesCount = await Recipe.find({ownerId: req.params.userId}).count({})
    .exec()
    .then(count => count)
    .catch(() => 0)

    console.log('userID: ' + req.params.userId)
    User.find({ _id: req.params.userId }).exec()
    .then(user => {
        if(user.length>0){
            res.status(200).json({
                name: user[0].nick,
                email: user[0].email,
                recipesCount: userRecipesCount,
                recipes: userRecipes,
            })
        }
        else{
            res.status(404).json({
                message: 'not found'
            })
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
    // console.log(req.query.name)
    // res.status(200).json({
    //     lol: 'lololo'
    // })

})

router.delete('/:userId', (req, res, next) => {
    User.remove({_id: req.params.userId}).exec()
        .then(result => {
            res.status(200).json({
                message: 'user deleted'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;