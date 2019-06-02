<script>
 import _ from 'lodash';
 import WordCloud from './WordCloud.svelte';
 import AutoComplete from './AutoComplete.svelte';
 import { currentApp } from './stores'
 import { getReviews, formatReviews, reviewsSentiment } from './reviews';

 $: appReviews = getReviews({appId:$currentApp.id});

 let gramOptions = _.range(1,6).map(x => x.toString());

 let gramOptionsValue = "2"

 $: formattedReviews = appReviews
   .then(r=> formatReviews({reviews:r, nGrams: parseInt(gramOptionsValue)}))

 $: currentAppReviewsSentiment = appReviews
   .then(reviews=>_.chain(reviews).map(reviewsSentiment).meanBy('score').value().toString());

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
 .card-stats {
   height: 12vmax;
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

          {#await currentAppReviewsSentiment}
          <h3 class="card-category">Loading...</h3>
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
<div class="container">
<p>Loading Word Cloud...</p>
</div>
{:then value}
<WordCloud words={value} />
{:catch error}
<p>Something went wrong: {error.message}</p>
{/await}
