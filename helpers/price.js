exports.calcPrice = (id) => {
  return new Promise((resolve, reject) => {
    const spotifyApi = require('../helpers/spotify')

    spotifyApi.getTrack(id).then((r)=> 
    {
      console.log('popularity'+r.body.popularity)
      resolve(r.body.popularity)
    }
  ).catch((r)=>reject(r))
  });
};



