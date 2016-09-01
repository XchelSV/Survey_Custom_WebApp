var mongoose = require('mongoose');

var questionSchema = mongoose.Schema({
    number: Number,
    question: String,
    type: String,
    options_type: [String]
});

var surveySchema = mongoose.Schema({
    user_id: String,
    nombre: String,
    date: Date,
    descripcion: String,
    tamano_col: String,
    preguntas:[questionSchema]
});

module.exports = mongoose.model('Survey', surveySchema);