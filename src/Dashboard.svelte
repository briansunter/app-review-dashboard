<script>
 export let currentApp;
 export let currentAppReviewsSentiment;
</script>
<style>
 .card-stats {
   height: 12vmax;
 }
</style>

<div class="row">
  <div class="col-lg-3 col-md-6 col-sm-6">
    <div class="card card-stats">
      <div class="card-header card-header-success card-header-icon">
        <div class="card-icon">
          <i class="material-icons">star</i>
        </div>
        <p class="card-category">Current Version</p>
        {#if currentApp}
        <h3 class="card-title">{currentApp.currentVersionRating}
          <small>Stars</small>
        </h3>
        {:else}
        <p>Loading...</p>
        {/if}
      </div>
      <div class="card-footer">
        {#if currentApp}
        <p class="card-category"> Out of {currentApp.currentVersionRatingCount} Reviews. </p>
        {:else}
        <p>Loading...</p>
        {/if}
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
        {#if currentApp}
        <h3 class="card-title">{currentApp.appRating}
          <small>Stars</small>
        </h3>
        {:else}
        <p>Loading...</p>
        {/if}
      </div>
      <div class="card-footer">
        {#if currentApp}
        <p class="card-category"> Out of {currentApp.appRatingCount} Reviews. </p>
        {:else }
        <p>Loading...</p>
        {/if}
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

        {#if currentAppReviewsSentiment}
        <h3 class="card-title">{currentAppReviewsSentiment.toString().substring(0,6)}</h3>
        {:else}
        <h3 class="card-category">Loading...</h3>
        {/if}
      </div>
      <div class="card-footer">
        {#if currentApp}
        <p class="card-category"> Out of {currentApp.appRatingCount} Reviews. </p>
        {:else}
        <p>Loading...</p>
        {/if}
      </div>
    </div>
  </div>
  <div class="col-lg-3 col-md-6 col-sm-6">
    <div class="card card-stats">
      <div class="card-header card-header-success card-header-icon">
        <div class="card-icon">
          <i class="material-icons">store</i>
        </div>
        {#if currentApp}
        <p class="card-category">{currentApp.name.substring(0,20)}</p>
        <h3 class="card-title">{currentApp.appPrice}</h3>
        {:else }
        <p>Loading...</p>
        {/if}
      </div>
      <div class="card-footer">
        {#if currentApp}
        <a class="card-category" href={currentApp.link}>Go to store</a>
        {:else}
        <p>Loading...</p>
        {/if}
      </div>
    </div>
  </div>
</div>
