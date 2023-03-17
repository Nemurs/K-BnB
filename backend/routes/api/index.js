// backend/routes/api/index.js
const router = require('express').Router();
const { restoreUser } = require("../../utils/auth.js");
router.use(restoreUser);

// Add a XSRF-TOKEN cookie
router.get("/csrf/restore", (req, res) => {
    const csrfToken = req.csrfToken();
    res.cookie("XSRF-TOKEN", csrfToken);
    res.status(200).json({
      'XSRF-Token': csrfToken
    });
  });

module.exports = router;
