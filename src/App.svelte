<script>
 import cloud from 'd3-cloud';
 import  nGram from 'n-gram';
 import { select } from 'd3-selection';
 import _ from 'lodash';
 import mimir from 'mimir';
 import sentiment from 'wink-sentiment';
 import autocomplete from 'autocompleter';
 import { onMount } from 'svelte';
 import { scaleLinear, scaleOrdinal } from 'd3-scale';
 import { schemePaired } from 'd3-scale-chromatic';
 import 'autocompleter/autocomplete.css';
 import 'material-dashboard/assets/css/material-dashboard.css';
 import 'material-dashboard/assets/css/bootstrap.min.css';

 const color = scaleOrdinal(schemePaired);
 const {tokenize } = mimir;
 const screenWidth = window.innerWidth;
 const screenHeight = window.innerHeight;

 export let name;
 let appId = '775737172';
 let promise = getReviews({appId:'775737172'});
 let gramOptions = _.range(1,6).map(x => x.toString());
 let gramOptionsValue = "2"
 let reviewsSentiment = "0";
 let appName = "iaWriter";
 let appPrice = "$8.99";
 let appRating = "4";
 let appRatingCount = "1014";
 let currentVersionRating = "4";
 let currentVersionRatingCount = "1024";

 let appLink = "https://itunes.apple.com/us/app/ia-writer/id775737172?mt=8&ign-mpt=uo%3D4";

 const stopFilter = new Set(["ourselves", "hers", "between", "yourself", "but", "again", "there", "about", "once", "during", "out", "very", "having", "with", "they", "own", "an", "be", "some", "for", "do", "its", "yours", "such", "into", "of", "most", "itself", "other", "off", "is", "s", "am", "or", "who", "as", "from", "him", "each", "the", "themselves", "until", "below", "are", "we", "these", "your", "his", "through", "don", "nor", "me", "were", "her", "more", "himself", "this", "down", "should", "our", "their", "while", "above", "both", "up", "to", "ours", "had", "she", "all", "no", "when", "at", "any", "before", "them", "same", "and", "been", "have", "in", "will", "on", "does", "yourselves", "then", "that", "because", "what", "over", "why", "so", "can", "did", "not", "now", "under", "he", "you", "herself", "has", "just", "where", "too", "only", "myself", "which", "those", "i", "after", "few", "whom", "t", "being", "if", "theirs", "my", "against", "a", "by", "doing", "it", "how", "further", "was", "here", "than","it","m"]);

 const appWords = new Set([...stopFilter, "it","a","lot","of","i","used","tto","would","as","well","app","way","best","able","using","nice","thank","like","work","the","want","really","back","try","seems","could","see","use","one","also","get","need","cant","first","good","looking","trying","needs","last","old","doesn","much","new","great","ive","ve","easy","dont","change","bought","purchased"]);

 function drawCloud(words) {

   select("#cloud").selectAll("svg").remove();

   select("#cloud")
     .append("svg")
     .attr("width", screenWidth)
     .attr("height", screenHeight)
     .append("g")
     .attr("transform", "translate(" + screenWidth / 2 + "," + screenHeight / 2 + ")")
     .selectAll("text")
     .data(words)
     .enter().append("text")
     .style("font-size", function(d) { return d.size + "px"; })
     .style("font-family", "Impact")
     .attr("text-anchor", "middle")
     .attr("transform", function(d) {
       return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
     })
     .text(function(d) { return d.text; })
     .style("fill", function(d, i ) { return color(i); });
 }

 function calculateCloud(data) {
   const fontScale = scaleLinear()
     .domain([0, 100])
     .range([18, 200]);

   cloud()
     .size([screenWidth, screenHeight])
     .words(data)
     .padding(5)
     .rotate(function() { return ~~(Math.random() * 2) * 90; })
     .font("Impact")
     .fontSize(function(d) { return  fontScale(d.size);})
     .on("end", drawCloud).start();
 }

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

 function sentimentReviews({ reviews }) {
   const sentiments = reviews.map(r => sentiment(r.title + r.content));
   return _.meanBy(sentiments,'score');
 }

 function handleClick(e) {
   promise = getReviews({appId}).then(r=> {
     const d3Text = formatReviews({reviews: r, nGrams:parseInt(gramOptionsValue)});
     calculateCloud(d3Text);
     reviewsSentiment = sentimentReviews({reviews:r}).toString();
   }).catch(console.log);
 }

 handleClick();

 let appNames = []
 onMount(async () => {

   var input = document.getElementById("appSearch");

   autocomplete({
     input: input,
     fetch: async function(text, update) {
       text = text.toLowerCase();
       let formattedText = encodeURI(text);
       let res = await fetch(`https://cors.io/?https://itunes.apple.com/search?term=${formattedText}&entity=software`);
       let apps = await res.json();

       let formattedApps = apps.results.map(a => ({value: a.trackId, label: a.trackName, link: a.trackViewUrl, currentVersionRatingCount: a.userRatingCountForCurrentVersion, currentVersionRating: a.averageUserRatingForCurrentVersion, appRating: a.averageUserRating, appRatingCount: a.userRatingCount, appPrice:a.formattedPrice}));

       update(formattedApps);
     },
     onSelect: function(item) {
       input.value = item.label;
       appId = item.value;
       appName = item.label;
       appPrice = item.appPrice;
       appLink = item.link;
       appRating = item.appRating;
       appRatingCount = item.appRatingCount;
       currentVersionRating = item.currentVersionRating;
       currentVersionRatingCount = item.currentVersionRatingCount;
       handleClick();
     }
   });
 });

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
        <h1 class="navbar-brand" href={appLink}> { appName } Dashboard</h1>
      </div>
      <form class="navbar-form">
        <div class="input-group border">
          <input id="appSearch" type="text" value="" class="form-control" placeholder="Search for an App...">
          <label class="gramSelectLabel" for="gramSelect"> nGrams </label>
          <select class="gramSelect" bind:value={gramOptionsValue} on:change={handleClick}>
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
          <h3 class="card-title">{currentVersionRating}
            <small>Stars</small>
          </h3>
        </div>
        <div class="card-footer">
          <p class="card-category"> Out of {currentVersionRatingCount} Reviews. </p>
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
          <h3 class="card-title">{appRating}
            <small>Stars</small>
          </h3>
        </div>
        <div class="card-footer">
          <p class="card-category"> Out of {appRatingCount} Reviews. </p>
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
          <h3 class="card-title">{reviewsSentiment.substring(0,6)}</h3>
        </div>
        <div class="card-footer">
          <p class="card-category"> Out of {appRatingCount} Reviews. </p>
        </div>
      </div>
    </div>
    <div class="col-lg-3 col-md-6 col-sm-6">
      <div class="card card-stats">
        <div class="card-header card-header-success card-header-icon">
          <div class="card-icon">
            <i class="material-icons">store</i>
          </div>
          <p class="card-category">{appName}</p>
          <h3 class="card-title">{appPrice}</h3>
        </div>
        <div class="card-footer">
          <a class="card-category" href={appLink}>Go to store </a>
        </div>
      </div>
    </div>
  </div>
</div>
<div id="cloud"> </div>
