var mongoose = require('mongoose');

var answerSchema = mongoose.Schema({
    survey_id: String,
    date: Date,
    answers : [String]
});

module.exports = mongoose.model('Answer', answerSchema);