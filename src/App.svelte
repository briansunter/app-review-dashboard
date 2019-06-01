<script>
 import  nGram from 'n-gram';
 import _ from 'lodash';
 import mimir from 'mimir';
 import sentiment from 'wink-sentiment';
 import WordCloud from './WordCloud.svelte';
 import AutoComplete from './AutoComplete.svelte';
 import { currentApp } from './stores'
 const {tokenize } = mimir;

 $: appReviews = getReviews({appId:$currentApp.id});

 let gramOptions = _.range(1,6).map(x => x.toString());

 let gramOptionsValue = "2"

 $: formattedReviews = appReviews
   .then(r=> formatReviews({reviews:r, nGrams: parseInt(gramOptionsValue)}))

 $: reviewsSentiment = appReviews
   .then(reviews=>_.chain(reviews).map(r => sentiment(r.title + r.content)).meanBy('score').value().toString());

 const stopFilter = new Set(["ourselves", "hers", "between", "yourself", "but", "again", "there", "about", "once", "during", "out", "very", "having", "with", "they", "own", "an", "be", "some", "for", "do", "its", "yours", "such", "into", "of", "most", "itself", "other", "off", "is", "s", "am", "or", "who", "as", "from", "him", "each", "the", "themselves", "until", "below", "are", "we", "these", "your", "his", "through", "don", "nor", "me", "were", "her", "more", "himself", "this", "down", "should", "our", "their", "while", "above", "both", "up", "to", "ours", "had", "she", "all", "no", "when", "at", "any", "before", "them", "same", "and", "been", "have", "in", "will", "on", "does", "yourselves", "then", "that", "because", "what", "over", "why", "so", "can", "did", "not", "now", "under", "he", "you", "herself", "has", "just", "where", "too", "only", "myself", "which", "those", "i", "after", "few", "whom", "t", "being", "if", "theirs", "my", "against", "a", "by", "doing", "it", "how", "further", "was", "here", "than","it","m"]);

 const appWords = new Set([...stopFilter, "it","a","lot","of","i","used","tto","would","as","well","app","way","best","able","using","nice","thank","like","work","the","want","really","back","try","seems","could","see","use","one","also","get","need","cant","first","good","looking","trying","needs","last","old","doesn","much","new","great","ive","ve","easy","dont","change","bought","purchased"]);

 async function getReviews({appId}) {
   var reviews = [];

   const reviewsResponse = await Promise.all(_.range(1,10).map(page => fetch(`https://itunes.apple.com/us/rss/customerreviews/id=${appId}/sortBy=mostRecent/page=${page}/json`).then(async r=> await r.json())));
   return reviewsResponse.filter(r => r.feed && r.feed.entry).map(r=>
     r.feed.entry.map(r =>
       ({rating:r["im:rating"].label,
         title: r.title.label,
         content:r.content.label}))).flat();
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
   let counted = _.countBy(grams);
   let sorted  = _.sortBy(Object.keys(counted), o => counted[o] * -1 );

   let d3Text = [];
   sorted.slice(0,1000).forEach(s => {
     let phrase = s.split(',').join(' ');
     d3Text.push({text: phrase, size: counted[s] });
   });
   return d3Text;
 }

</script>

<style>
 .input-group {
   padding: 5pt;
   background-color: white;
 }

 .gramSelect {
   padding: 5pt;
   padding-left:10pt;
   padding-right:10pt;
 }

 .gramSelectLabel {
   padding: 5pt;
 }
</style>

<div class="container">
  <div class="row">
    <div class="container-fluid">
      <div class="navbar-wrapper">
        <h1 class="navbar-brand" href={$currentApp.appLink}>{ $currentApp.name } Dashboard</h1>
      </div>
      <form class="navbar-form">
        <div class="input-group border">
          <AutoComplete />
          <label class="gramSelectLabel" for="gramSelect"> nGrams </label>
          <select class="gramSelect" bind:value={gramOptionsValue}>
            {#each gramOptions as go}
            <option value={go}>{go}</option>
            {/each}
          </select>
        </div>
      </form>
    </div>
  </div>

  <div class="row">
    <div class="col-lg-3 col-md-6 col-sm-6">
      <div class="card card-stats">
        <div class="card-header card-header-success card-header-icon">
          <div class="card-icon">
            <i class="material-icons">star</i>
          </div>
          <p class="card-category">Current Version</p>
          <h3 class="card-title">{$currentApp.currentVersionRating}
            <small>Stars</small>
          </h3>
        </div>
        <div class="card-footer">
          <p class="card-category"> Out of {$currentApp.currentVersionRatingCount} Reviews. </p>
        </div>
      </div>
    </div>
    <div class="col-lg-3 col-md-6 col-sm-6">
      <div class="card card-stats">
        <div class="card-header card-header-warning card-header-icon">
          <div class="card-icon">
            <i class="material-icons">rate_review</i>
          </div>
          <p class="card-category">Average Rating</p>
          <h3 class="card-title">{$currentApp.appRating}
            <small>Stars</small>
          </h3>
        </div>
        <div class="card-footer">
          <p class="card-category"> Out of {$currentApp.appRatingCount} Reviews. </p>
        </div>
      </div>
    </div>
    <div class="col-lg-3 col-md-6 col-sm-6">
      <div class="card card-stats">
        <div class="card-header card-header-success card-header-icon">
          <div class="card-icon">
            <i class="material-icons">sentiment_satisfied</i>
          </div>
          <p class="card-category">Sentiment</p>

          {#await reviewsSentiment}
          <h3 class="card-title">Loading Sentiment...</h3>
          {:then value}
          <h3 class="card-title">{value.substring(0,6)}</h3>
          {:catch error}
          <p>Something went wrong: {error.message}</p>
          {/await}
        </div>
        <div class="card-footer">
          <p class="card-category"> Out of {$currentApp.appRatingCount} Reviews. </p>
        </div>
      </div>
    </div>
    <div class="col-lg-3 col-md-6 col-sm-6">
      <div class="card card-stats">
        <div class="card-header card-header-success card-header-icon">
          <div class="card-icon">
            <i class="material-icons">store</i>
          </div>
          <p class="card-category">{$currentApp.name}</p>
          <h3 class="card-title">{$currentApp.appPrice}</h3>
        </div>
        <div class="card-footer">
          <a class="card-category" href={$currentApp.link}>Go to store </a>
        </div>
      </div>
    </div>
  </div>
</div>

{#await formattedReviews}
<p>Loading Word Cloud...</p>
{:then value}
<WordCloud words={value} />
{:catch error}
<p>Something went wrong: {error.message}</p>
{/await}
