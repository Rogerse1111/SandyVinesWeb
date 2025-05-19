// fetches a handful of items via the Amazon Product Advertising API
// caches the result in memory for 12 h to avoid throttling

require('dotenv').config();
const https       = require('https');
const crypto      = require('crypto');

const CACHE = { data: null, ts: 0 };
const TTL   = 12 * 60 * 60 * 1000;  // 12 hours

module.exports = async function getGear() {
  if (Date.now() - CACHE.ts < TTL) return CACHE.data;

  const asinList = ['B01MY0NCMF', 'B07Y8P9R64', 'B095HF4PXT']; // update ASINs
  const promises = asinList.map(asin => signedRequest(asin));
  const items    = (await Promise.all(promises)).filter(Boolean);

  CACHE.data = items; CACHE.ts = Date.now();
  return items;
};


// ----- helpers ----------------------------------------------------------
function signedRequest(asin){
  const params = {
    'Service':    'AWSECommerceService',
    'AssociateTag': process.env.AMAZON_TRACKING_ID,     // e.g. sandyvines-20
    'AWSAccessKeyId': process.env.AMAZON_ACCESS_KEY,
    'Operation':  'ItemLookup',
    'IdType':     'ASIN',
    'ItemId':     asin,
    'ResponseGroup':'Images,ItemAttributes,Offers',
    'Timestamp':  new Date().toISOString()
  };
  const keys = Object.keys(params).sort();
  const query = keys.map(k => k + '=' + encodeURIComponent(params[k])).join('&');

  const stringToSign = `GET\nwebservices.amazon.com\n/onca/xml\n${query}`;
  const signature = crypto.createHmac('sha256', process.env.AMAZON_SECRET_KEY)
                          .update(stringToSign).digest('base64');
  const url = `https://webservices.amazon.com/onca/xml?${query}&Signature=` +
              encodeURIComponent(signature);

  return new Promise(resolve => {
    https.get(url, res => {
      let xml=''; res.on('data', d=>xml+=d);
      res.on('end', ()=> {
        const title   = xml.match(/<Title>([^<]+)/)?.[1];
        const img     = xml.match(/<MediumImage>.*?<URL>([^<]+)/s)?.[1];
        const price   = xml.match(/<OfferListing.*?<FormattedPrice>([^<]+)/s)?.[1];
        resolve(title && img ? { asin, title, img, price } : null);
      });
    }).on('error', ()=> resolve(null));
  });
}
