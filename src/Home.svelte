<script>
 import range from 'lodash/range';
 import meanBy from 'lodash/meanBy';
 import WordCloud from './WordCloud.svelte';
 import AutoComplete from './AutoComplete.svelte';
 import Dashboard from './Dashboard.svelte';

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
  {#await Promise.all([currentApp,currentAppReviewsSentiment])}
  <Dashboard />
  {:then val}
  <Dashboard currentApp={val[0]} currentAppReviewsSentiment={val[1]} />
  {/await}

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
