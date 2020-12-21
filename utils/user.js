const mongoose = require('mongoose');
const User = require('../models/user');

getNameById = (id) => {
    User.findOne({_id: id})
    .then(user => {
        console.log('caly user');
        console.log(user)
        return user.nick;
    })
    .catch(err => {
        console.log(err);
        return '';
    })
}

module.exports = getNameById;