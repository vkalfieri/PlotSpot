const Validator = require('validator');
const isEmpty = require ('./is-empty');

module.exports = function validatePublishedworksInput(data) {
    let errors = {};

  
    data.title = !isEmpty(data.title) ? data.title : '';
    data.author = !isEmpty(data.author) ? data.author : '';
   
   

if(Validator.isEmpty(data.title)) {
    errors.password = 'Book title is required';
}

if(Validator.isEmpty(data.author)) {
    errors.password = 'Author field is required';
}


return {
    errors,
    isValid: isEmpty(errors)
};
}