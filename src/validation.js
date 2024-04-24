const Joi = require('joi');
const addUserValidation = async (req, res, next) => {
    const { value, error } = Joi.object({
        name: Joi.string().required(),
        isSuperUser: Joi.boolean(),
        type: Joi.string().required(),
    }).validate(req.body)
    if (error) {
        return next(res.send(error.details[0].message));
    }
    return next();
};

const addBookValidation = async (req, res, next) => {
    const { value, error } = Joi.object({
        title: Joi.string().required(),
        author: Joi.string().required(),
        authorId: Joi.string().required(),
        year: Joi.number().required(),
    }).validate(req.body);
    console.log(value)
    if (error) {
        return next(res.send(error.details[0].message));
    }
    return next();
}
const updateBookValidation = async (req, res, next) => {
    const { value, error } = Joi.object({
        title: Joi.string(),
        year: Joi.number(),
        author: Joi.string(),
        authorId: Joi.string()
    })
        .and('author', 'authorId')
        .or('title', 'author', 'year', 'authorId')
        .validate(req.body);
    console.log(value)
    if (error) {
        return next(res.send(error.details[0].message));
    }
    return next();
}

module.exports = {
    addUserValidation,
    addBookValidation,
    updateBookValidation
}