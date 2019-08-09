import range from 'lodash/range';
import map from 'lodash/map';
import countBy from 'lodash/countBy';
import sortBy from 'lodash/sortBy';
import nGram from 'n-gram';
import { tokenize } from 'mimir';
import sentiment from 'wink-sentiment';

const stopFilter = new Set(["ourselves", "hers", "between", "yourself", "but", "again", "there", "about", "once", "during", "out", "very", "having", "with", "they", "own", "an", "be", "some", "for", "do", "its", "yours", "such", "into", "of", "most", "itself", "other", "off", "is", "s", "am", "or", "who", "as", "from", "him", "each", "the", "themselves", "until", "below", "are", "we", "these", "your", "his", "through", "don", "nor", "me", "were", "her", "more", "himself", "this", "down", "should", "our", "their", "while", "above", "both", "up", "to", "ours", "had", "she", "all", "no", "when", "at", "any", "before", "them", "same", "and", "been", "have", "in", "will", "on", "does", "yourselves", "then", "that", "because", "what", "over", "why", "so", "can", "did", "not", "now", "under", "he", "you", "herself", "has", "just", "where", "too", "only", "myself", "which", "those", "i", "after", "few", "whom", "t", "being", "if", "theirs", "my", "against", "a", "by", "doing", "it", "how", "further", "was", "here", "than","it","m", "undefined"]);

const appWords = new Set([...stopFilter, "it","a","lot","of","i","used","tto","would","as","well","app","way","best","able","using","nice","thank","like","work","the","want","really","back","try","seems","could","see","use","one","also","get","need","cant","first","good","looking","trying","needs","last","old","doesn","much","new","great","ive","ve","easy","dont","change","bought","purchased"]);

async function getReviews({appId}) {
  var reviews = [];

  const reviewsResponse = await Promise.all(range(1,11).map(page => fetch(`https://itunes.apple.com/us/rss/customerreviews/id=${appId}/sortBy=mostRecent/page=${page}/json`).then(async r=> await r.json())));
  return reviewsResponse
    .filter(r => r.feed && r.feed.entry)
    .map(r=> r.feed.entry.map(r => ({rating:r["im:rating"].label, content:r.content.label, title:r.title.label,version:r["im:version"].label,sentiment:sentiment(r.title.label + r.content.label).score})))
    .flat();
}

function isSuperset(set, subset) {
  for (var elem of subset) {
    if (!set.has(elem)) {
      return false;
    }
  }
  return true;
}

function formatReviews({ reviews, nGrams }) {
  let grams = reviews
      .map(r => nGram(nGrams)(tokenize(r.content + r.title).filter(w=> !stopFilter.has(w))))
      .filter(tg => !isSuperset(appWords, new Set(tg)))
      .flat();
  let counted = countBy(grams);
  let sorted  = sortBy(Object.keys(counted), o => counted[o] * -1 );

  let d3Text = [];

  sorted.slice(0,1000).forEach(s => {
    let phrase = s.split(',').join(' ');
    d3Text.push({text: phrase, size: counted[s] });
  });
  return d3Text;
}

function reviewsSentiment(review) {
  return sentiment(review.title + review.content);
}

async function getApp(appId) {
  let appRes = await fetch(`https://cors-anywhere.herokuapp.com/https://itunes.apple.com/lookup?id=${appId}`);
  let appJson = await appRes.json();
  let resultJson = appJson.results[0];
  return {id: resultJson.trackId, name:resultJson.trackName, link: resultJson.trackViewUrl, currentVersionRatingCount: resultJson.userRatingCountForCurrentVersion, currentVersionRating: resultJson.averageUserRatingForCurrentVersion, appRating: resultJson.averageUserRating, appRatingCount: resultJson.userRatingCount, appPrice:resultJson.formattedPrice};
}

export  {getApp, getReviews, formatReviews, reviewsSentiment};
