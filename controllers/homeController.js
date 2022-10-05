const bigPromise = require('../middleware/bigPromise')

exports.home = bigPromise((req, res) => {
    res.status(200).json({
        success: true,
        greeting: "Hello From api"
    });
})

exports.homeDummy = (req, res) => {
    res.status(200).json({
        success: true,
        greeting: "This is dummy route"
    });
}