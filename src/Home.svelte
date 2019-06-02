<script>
 import range from 'lodash/range';
 import meanBy from 'lodash/meanBy';
 import WordCloud from './WordCloud.svelte';
 import AutoComplete from './AutoComplete.svelte';
 import { getApp, getReviews, formatReviews, reviewsSentiment } from './reviews';

 import 'material-dashboard/assets/css/material-dashboard.css';
 import 'material-dashboard/assets/css/bootstrap.min.css';
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
 .card-stats {
   height: 12vmax;
 }

</style>

<div class="container">
  <div class="row">
    <div class="container-fluid">
      <div class="navbar-wrapper">
        {#await currentApp}
        <p>Loading...</p>
        {:then value}
        <h1 class="display-2" href={value.appLink}>{ value.name } Dashboard</h1>
        {/await}
      </div>
      <form class="navbar-form">
        <div class="input-group border mb-3 flex-nowrap">
          <AutoComplete />
          <div class="input-group-append" >
          <label class="gramSelectLabel" for="gramSelect"> nGrams </label>
          <select class="gramSelect" bind:value={gramOptionsValue}>
            {#each gramOptions as go}
            <option value={go}>{go}</option>
            {/each}
          </select>
          </div>
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

          {#await currentApp}
          <p>Loading...</p>
          {:then value}
          <h3 class="card-title">{value.currentVersionRating}
            <small>Stars</small>
          </h3>
          {/await}
        </div>
        <div class="card-footer">
          {#await currentApp}
          <p>Loading...</p>
          {:then value}
          <p class="card-category"> Out of {value.currentVersionRatingCount} Reviews. </p>
          {/await}
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
          {#await currentApp}
          <p>Loading...</p>
          {:then value}

          <h3 class="card-title">{value.appRating}
            <small>Stars</small>
          </h3>
          {/await}
        </div>
        <div class="card-footer">
          {#await currentApp}
          <p>Loading...</p>
          {:then value}
          <p class="card-category"> Out of {value.appRatingCount} Reviews. </p>
          {/await}
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
          <h3 class="card-title">{value.toString().substring(0,6)}</h3>
          {:catch error}
          <p>Something went wrong: {error.message}</p>
          {/await}
        </div>
        <div class="card-footer">
          {#await currentApp}
          <p>Loading...</p>
          {:then value}
          <p class="card-category"> Out of {value.appRatingCount} Reviews. </p>
          {/await}
        </div>
      </div>
    </div>
    <div class="col-lg-3 col-md-6 col-sm-6">
      <div class="card card-stats">
        <div class="card-header card-header-success card-header-icon">
          <div class="card-icon">
            <i class="material-icons">store</i>
          </div>
          {#await currentApp}
          <p>Loading...</p>
          {:then value}
          <p class="card-category">{value.name.substring(0,20)}</p>
          <h3 class="card-title">{value.appPrice}</h3>
          {/await}
        </div>
        <div class="card-footer">
          {#await currentApp}
          <p>Loading...</p>
          {:then value}
          <a class="card-category" href={value.link}>Go to store </a>
          {/await}
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
