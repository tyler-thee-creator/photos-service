const db = require('./database/index.js');
const mongoose = require('mongoose');
const faker = require('faker');
const getPhotos = require('./data/getPhotoUrls.js');


const populateDb = () => {
  Promise.all([getPhotos.getPhotoUrls('primary'), getPhotos.getPhotoUrls('images')])
  .then(([primaryUrls, imagesUrls]) => {
    console.log(imagesUrls.length);
    savePhotos(primaryUrls, imagesUrls);
  })
  .catch((err) => console.error(err))
}


const savePhotos = (primaryUrls, productPhotosUrls) => {

  let dbRecords = [];
  let featuresPhotoSizes = [[960, 832], [960, 400], [960, 123], [960, 832], [700, 568], [700, 568], [700, 568], [960, 832], [547, 454], [300, 270], [300, 270], [300, 270], [50, 50], [50, 50], [50, 50], [50, 50], [50, 50]];
  let numberOfProductImages = 7;

  for (let i = 0, j = 0; i < 100; i++) {
    let features = [];
    let images = [];
    // number of available photos in host service is 300. 7 pictures per product 300/7 = 42.8.
    // the rest of the product pictures are mocked using faker.
    if (i < 42) {
      for (let h = 0; h < featuresPhotoSizes.length; h++) {
        if (h < numberOfProductImages) {
          images.push(productPhotosUrls[j]);
          j++;
        }
        let photoWidth = featuresPhotoSizes[h][0];
        let photoHeight = featuresPhotoSizes[h][1];
        features.push(`http://placeimg.com/${photoWidth}/${photoHeight}`);
      }
      let item = {
        productId: i + 1,
        primaryUrl: primaryUrls[i],
        productUrls: images,
        featuresUrls: features
      }
      dbRecords.push(item);
    } else {
      for (let h = 0; h < featuresPhotoSizes.length; h++) {
        if (h < numberOfProductImages) {
          images.push(faker.image.imageUrl());
        }
        let photoWidth = featuresPhotoSizes[h][0];
        let photoHeight = featuresPhotoSizes[h][1];
        features.push(`http://placeimg.com/${photoWidth}/${photoHeight}`);
      }
      let item = {
        productId: i + 1,
        primaryUrl: primaryUrls[i],
        productUrls: images,
        featuresUrls: features
      }
      dbRecords.push(item);
    }
  }

  let recordsToSave = dbRecords.map(item => {
    db.Photo.findOneAndUpdate({ id: item.productId }, item, { upsert: true, new: true }).exec();
  });

  Promise.all(recordsToSave)
  .then(result => {
    console.log(`${result.length} records saved in db`);
  })
}

populateDb();

module.exports.populateDb = populateDb;