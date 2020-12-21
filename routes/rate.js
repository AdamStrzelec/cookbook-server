const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Rate = require('../models/rate');
const Recipe = require('../models/recipe');

router.post('/', checkAuth, (req, res, next)=>{
    
    Rate.find({recipeId: req.body.recipeId, reviewerId: req.userData.userId})
    .exec()
    .then(result => {
        console.log('length: '+result.length + ' ' + req.userData.userId)
        if(result.length>0){
            return res.status(403).json({message: 'Nie możesz dodać oceny dla tego przepisu ponownie'})
        }else{
            Recipe.find({ 
                _id: req.body.recipeId,
                ownerId: req.userData.userId
             }).exec()
            .then(result => {
                console.log('length 2: '+result.length + ' ' + req.userData.userId);
                console.log(result)
                if(result.length>0){
                    
                    // console.log('compare')
                    // console.log(ownerId);
                    // console.log(req.userData.userId);
                    return res.status(403).json({message: 'Nie możesz dodać oceny dla swojego przepisu'})
                }else{
                        const rate = new Rate({
                            _id: new mongoose.Types.ObjectId(),
                            recipeId: req.body.recipeId,
                            reviewerId: req.userData.userId,
                            rate: req.body.rate
                        })
                        if(req.body.rate%1==0 && req.body.rate>=1 && req.body.rate<=5){
                        rate.save()
                        .then(()=>{
                            changeAverageRate(req.body.recipeId)
                            return res.status(201).json({
                                message: 'rate added'
                            })
                        })
                        .catch(err => {res.status(500).json({error: err})});
                    }else{
                        return res.status(409).json({
                            message: 'unvalidable rate'
                        })
                    }
                }
            })
        }
    })
    .catch(err => {res.status(500).json({error: err})});
})

changeAverageRate = (recipeId) => {
    Rate.find({ recipeId: recipeId })
    .exec()
    .then(rates => {
        let sum = 0;
        for(let i=0; i<rates.length; i++){
            sum += rates[i].rate;
        }
        const avgRate = sum/rates.length;
        Recipe.findOneAndUpdate({ _id: recipeId }, { averageRate: avgRate }).exec()
        .then(()=>{
            console.log('average rate updated');
            console.log(avgRate)
        })
        .catch(err => {
            console.log(err);
        })
    })
    
}

module.exports = router;