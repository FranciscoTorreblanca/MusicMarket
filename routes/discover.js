const router      = require('express').Router()
const spotifyApi = require('../helpers/spotify')

router.get ("/",(req,res,next)=>{
  spotifyApi.getAvailableGenreSeeds()
    .then(genres=> {
      res.render("discover/discover",{genre:genres.body.genres})
    }).catch(e=>console.log(e))
})

router.post("/results",(req,res,next)=>{
  const {searchTrack} = req.body
  spotifyApi.searchTracks(searchTrack)
    .then(tracks=>{
      res.render("discover/results",{tracks:tracks.body.tracks.items,search:searchTrack})
    })
    .catch(e=>console.log(e))
})

router.get("/:genre",(req,res,next)=>{
  const {genre} = req.params
  spotifyApi.searchTracks(`genre:${genre}`)
  .then(tracks=>{
    res.render("discover/genreDetail",{tracks:tracks.body.tracks.items ,genre})
  })
})
module.exports = router