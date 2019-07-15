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
</style>

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
          <h3 class="card-category">A dashboard for your iOS App Store reviews</h3>
        </div>
        <form class="navbar-form">
          <div class="input-group mb-3 flex-nowrap">
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
