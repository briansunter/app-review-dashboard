<script>
 import cloud from 'd3-cloud';
 import  nGram from 'n-gram';
 import { select } from 'd3-selection';
 import _ from 'lodash';
 import mimir from 'mimir';
 import sentiment from 'wink-sentiment';
 import autocomplete from 'autocompleter';
 import { onMount } from 'svelte';
 import { scaleOrdinal } from 'd3-scale';
 import { schemePaired } from 'd3-scale-chromatic';
 import 'autocompleter/autocomplete.css';

 const color = scaleOrdinal(schemePaired);
 const {tfidf, tokenize } = mimir;
 export let name;
 let appId = '775737172';
 let promise = getReviews({appId:'775737172'});
 let gramOptions = _.range(1,6).map(x => x.toString());
 let gramOptionsValue = "2"
 let reviewsSentiment = "0";

 const screenWidth = window.innerWidth;
 const screenHeight = window.innerHeight;
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
   cloud()
     .size([screenWidth, screenHeight])
     .words(data)
     .padding(5)
     .rotate(function() { return ~~(Math.random() * 2) * 90; })
     .font("Impact")
     .fontSize(function(d) { return d.size; })
     .on("end", drawCloud).start();
 }

 async function getReviews({appId}) {
   var reviews = [];

   for (var page = 1; page < 10 ; page++) {
     const res = await fetch(`https://itunes.apple.com/us/rss/customerreviews/id=${appId}/sortBy=mostRecent/page=${page}/json`);
     if (res.ok) {
       const jsonResponse = await res.json();
       const entries =jsonResponse.feed.entry;
       if (entries){
         const convertedReviews = entries.map(r =>
           ({rating:r["im:rating"].label,
             title: r.title.label,
             content:r.content.label}));

         reviews.push(convertedReviews);
       } else {
         break;
       }
     } else {
       throw new Error(jsonResponse);
     }
   }
   return reviews.flat();
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
     d3Text.push({text: phrase, size: counted[s]*3 });
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

       let formattedApps = apps.results.map(a => ({value: a.trackId, label: a.trackName}));
       update(formattedApps);
     },
     onSelect: function(item) {
       input.value = item.label;
       console.log("selected");
       appId = item.value;
       handleClick();
     }
   });
 });

</script>

<style>
 h1 {
   color: purple;
 }
</style>

<h1>App Reviews </h1>
<h2>Average Sentiment: {reviewsSentiment} </h2>
<button on:click={handleClick}>
  Get App Reviews
</button>

<input class "autoComplete" id="appSearch" >

<label for="gramSelect"> nGrams </label>
<select class="gramSelect" bind:value={gramOptionsValue} on:change={handleClick}>
  {#each gramOptions as go}
  <option value={go}>{go}</option>
  {/each}
</select>

<div id="cloud"> </div>
