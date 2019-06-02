<script>
 import autocomplete from 'autocompleter';
 import _ from 'lodash';
 import { onMount } from 'svelte';
 import 'autocompleter/autocomplete.css';
 import 'material-dashboard/assets/css/material-dashboard.css';
 import 'material-dashboard/assets/css/bootstrap.min.css';
 import { currentApp } from './stores'

 let apps = {};
 /* export let currentApp = {}; */
 export let selectedApp = () => null;

 onMount(async () => {
   var input = document.getElementById("appSearch");
   autocomplete({
     input: input,
     fetch: async function(text, update) {
       text = text.toLowerCase();
       let formattedText = encodeURI(text);

       let cacheApps = _.values(apps).map(a => ({value: a.id , label: a.name}));
       update(cacheApps);

       let res = await fetch(`https://cors.io/?https://itunes.apple.com/search?term=${formattedText}&entity=software`);
       let appsResponse = await res.json();

       let formattedApps = appsResponse.results.map(a=> ({id: a.trackId, name:a.trackName, link: a.trackViewUrl, currentVersionRatingCount: a.userRatingCountForCurrentVersion, currentVersionRating: a.averageUserRatingForCurrentVersion, appRating: a.averageUserRating, appRatingCount: a.userRatingCount, appPrice:a.formattedPrice}));
       apps =  _.chain(formattedApps).groupBy('id').mapValues(x=>x[0]).value();

       let labelApps = _.values(apps).map(a => ({value: a.id , label: a.name}));
       update(labelApps);
     },
     onSelect: function(item) {
       input.value = item.label;
       currentApp.set(apps[item.value]);
       selectedApp(apps[item.value]);
     }
   });
 });
</script>

<input id="appSearch" type="text" value="" class="appSearch" placeholder="Search for an App..." autocomplete="off">
