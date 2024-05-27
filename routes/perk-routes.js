const express = require("express");
const perks = require('../controllers/perks-controller')

const router = express.Router();


router.post('/youtube-playlist',perks.youtubePlaylist)
router.get('/youtube-playlist',perks.getYoutubePlaylist)
router.delete('/youtube-playlist/:id',perks.deleteYoutubePlaylist)
router.put('/youtube-playlist/:id',perks.updateYoutubePlaylist)


module.exports = router