<script>
 import range from 'lodash/range';
 import meanBy from 'lodash/meanBy';
 import WordCloud from './WordCloud.svelte';
 import AutoComplete from './AutoComplete.svelte';
 import Dashboard from './Dashboard.svelte';
 import ReviewTable from './ReviewTable.svelte';

 import { getApp, getReviews, formatReviews, reviewsSentiment } from './reviews';

 import 'material-dashboard/assets/css/material-dashboard.css';
 import 'material-dashboard/assets/css/bootstrap.min.css';
 import './main.css';

 const defaultAppId = 284882215;
 export let appId = 284882215;

 $: currentApp = getApp(appId || defaultAppId);

 $: appReviews = currentApp.then(ca => getReviews({appId: ca.id}));

 let gramOptions = range(1,6).map(x => x.toString());

 let gramOptionsValue = "2"

 $: formattedReviews = appReviews
   .then(r=> formatReviews({reviews:r, nGrams: parseInt(gramOptionsValue)}))

 $: currentAppReviewsSentiment = appReviews
   .then(reviews=>meanBy(reviews.map(reviewsSentiment),'score'));
</script>

<style>
 .navbar-brand {
   font-size: 40pt;
   margin-top: 20pt;
   margin-bottom: 20pt;
 }

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

 .cloud {
   min-height:90vh;
   min-width:80vh;
 }

 .github-corner svg {
     z-index: 10;
 }

 .github-corner:hover .octo-arm{
     animation:octocat-wave 560ms ease-in-out
 }

 @keyframes octocat-wave{
     0%,100%{transform:rotate(0)}
     20%,60%{transform:rotate(-25deg)}
     40%,80%{transform:rotate(10deg)}}
 @media (max-width:500px){
     .github-corner:hover .octo-arm{animation:none}
     .github-corner .octo-arm{animation:octocat-wave 560ms ease-in-out}}
</style>

<a href="https://github.com/briansunter/app-review-dashboard" class="github-corner" aria-label="View source on GitHub"><svg width="80" height="80" viewBox="0 0 250 250" style="fill:#151513; color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg></a>

<div class="container-fluid">
  <div class="row">
    <div class="col-md-12">
      <div class="card">
        <div class="card-header card-header-primary">
          {#await currentApp}
          <h2 class="card-title">Loading... </h2>
          {:then value}
          <h2 class="card-title">{ value.name }</h2>
          {/await}
          <h3 class="card-category">A dashboard for your iOS App Store reviews.</h3>
        </div>
        <form class="navbar-form">
          <div class="input-group mb-3 flex-nowrap">
            <AutoComplete />
          </div>
        </form>
      </div>
    </div>
  </div>
  {#await Promise.all([currentApp,currentAppReviewsSentiment])}
  <Dashboard />
  {:then val}
  <Dashboard currentApp={val[0]} currentAppReviewsSentiment={val[1]} />
  {/await}
</div>

<div class="content">
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header card-header-primary">
            <h2 class="card-title">Word Cloud</h2>
            <h3 class="card-category">A word cloud made from most frequent words in app reviews.</h3>
            <div class="input-group-append" >
              <label class="gramSelectLabel" for="gramSelect"> nGrams </label>
              <select class="gramSelect" bind:value={gramOptionsValue}>
                {#each gramOptions as go}
                <option value={go}>{go}</option>
                {/each}
              </select>
            </div>
          </div>
          <div class="card-body">
            {#await formattedReviews}
            <div class="container cloud">
              <p>Loading Word Cloud...</p>
            </div>
            {:then value}
            <WordCloud words={value} />
            {:catch error}
            <p>Something went wrong: {error.message}</p>
            {/await}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{#await appReviews}
<div class="container">
  <ReviewTable />
</div>
{:then reviews}
<ReviewTable reviews={reviews} />
{:catch error}
<p>Something went wrong: {error.message}</p>
{/await}
