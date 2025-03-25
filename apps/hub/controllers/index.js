module.exports = function (req, res) {
    return res.render("index", {
        layout: false,
        shared: {
            hostname: req.hostname.replace("my.", "")
        }
    });
}