const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const checkAuth = require('../middleware/check-auth');
const getNameById = require('../utils/user');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Math.random().toString(36).substr(2, 3) +
                "-" + Math.random().toString(36).substr(2, 3) +
                "-" + Math.random().toString(36).substr(2, 4) +
                "-" + file.originalname)
    }
})

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, validateRecipe(req));
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
})

const Recipe = require('../models/recipe');
const Rate = require('../models/rate');
const User = require('../models/user');

validateRecipe = (req) => {
    const body = JSON.parse(JSON.parse(JSON.stringify(req.body.recipe)))
    const recipe = new Recipe({
        _id: new mongoose.Types.ObjectId(),
        ownerId: req.userData.userId,
        ownerNick: req.userData.nick,
        name: body.name,
        type: body.type,
        description: body.description,
        ingredients: body.ingredients,
        preparationDescription: body.preparationDescription,
        averageRate: 0,
    })
    const error = recipe.validateSync();
    if(error){
        return false;
    }else{
        return true;
    }
}

router.post('/', checkAuth, (req, res)=>{
    console.log(req.body.recipe)

    const recipe = new Recipe({
        _id: new mongoose.Types.ObjectId(),
        ownerId: req.userData.userId,
        ownerNick: req.userData.nick,
        name: req.body.recipe.name,
        type: req.body.recipe.type,
        description: req.body.recipe.description,
        ingredients: req.body.recipe.ingredients,
        preparationDescription: req.body.recipe.preparationDescription,
        averageRate: 0,
        imagePath: req.body.recipe.imagePath
    })  
    recipe.save()
    .then((recipe)=>{
        res.status(201).json({
            message: 'recipe added',
            recipeId: recipe._id
        })
    })
    .catch(err => {
        console.log(recipe)
        res.status(500).json({
            error: err
        })
    })
})


// router.delete('/', checkAuth, (req, res, next)=>{
//     let fileName;
//     Recipe.findOne({ _id: req.body.recipeId })
//     .exec()
//     .then(recipe => {
//         const indexOf = recipe.imagePath.indexOf('/uploads');
//         fileName = '.'+recipe.imagePath.substring(indexOf);
//         // if(recipe.ownerId==req.userData.userId){ <- owner id
//             if(req.userData.userId=='5fdf734542777b1dcc3862a3'){ // <- admin id
//             Recipe.deleteOne({_id: req.body.recipeId})
//             .then(()=>{
//                 fs.unlink(fileName, (err) => {
//                     if (err) {
//                         console.log(err)
//                         throw err
//                     };
//                 });
//                 Rate.deleteMany({recipeId: req.body.recipeId})
//                 .then(()=>{
//                     res.status(200).json({message: 'recipe deleted'});
//                 })
//                 .catch((err) => {
//                     res.status(500).json({error: err});
//                 })
//             })
//             .catch(err => res.status(500).json({error: err}))
//         }else{
//             res.status(403).json({message: 'no access'})
//         }
//     })
//     .catch(err => {
//         res.status(500).json({
//             error: err
//         })
//     })
// })

router.get('/id/:recipeId', (req, res, next) => {
    Recipe.findOne({ _id: req.params.recipeId })
    .exec()
    .then(recipe => {
        res.status(200).json({
            recipe
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

router.get('/page/:nr', async (req, res, next) => {
    let query;
    if(req.query.type){
        query = {
            name: { "$regex": req.query.name, "$options": "i" },
            type: req.query.type }
    }else{
        query = {name: { "$regex": req.query.name, "$options": "i" }}
    }

    const totalCount = await Recipe.find(query).count({})
    .exec()
    .then(count => {
        return count;
    })
    .catch(err => console.log(err))
    console.log('total count');
    console.log(totalCount);

    const perPage = 10;

    Recipe.find(query)
    .select('ownerNick name type description preparationDescription averageRate imagePath')
    .limit(perPage)
    .skip((req.params.nr-1)*perPage)
    .sort([['createdAt', -1]])
    .exec()
    .then((recipes, i) => {
        res.status(200).json({
            totalCount: totalCount,
            recipes
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

router.get('/find', (req, res, next) => {
    // console.log(req.params.name)
    // console.log('type')
    // console.log(req.query.type)
    
    let query;
    if(req.query.type){
        query = { name: { "$regex": req.query.name, "$options": "i" }, type: req.query.type}
    }else{
        query = { name: { "$regex": req.query.name, "$options": "i" }}
    }
    Recipe.find(query)
    .select('name type averageRate imagePath')
    .sort([['createdAt', -1]])
    .exec()
    .then(recipes => {
        res.status(200).json({recipes})
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

router.get('/top/:count', async (req, res, next) => {
    console.log('limit '+req.params.count)
    const limit = await req.params.count
    Recipe.find()
    .select('ownerNick name type description preparationDescription averageRate imagePath')
    .limit(parseInt(req.params.count))
    .sort([['averageRate', -1]])
    .exec()
    .then((recipes) => {
        res.status(200).json({
            // totalCount: totalCount,
            recipes
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

module.exports = router;