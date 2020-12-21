const mongoose = require('mongoose');
var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    nick: { 
        type: String, 
        required: 'Pole login jest wymagane', 
        unique: true, 
        minlength: [4, 'Pole login musi posiadać minimum 4 znaki'], 
        maxlength: [12, 'Pole login może posiadać maksumalnie 12 znaków']},
    email: { type: String, required: 'Adres e-mail jest wymagany', unique: true, validate: [validateEmail, 'Nieprawidłowy adres e-mail']  },
    password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
