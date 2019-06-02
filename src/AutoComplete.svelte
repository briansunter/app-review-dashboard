<script>
 import autocomplete from 'autocompleter';
 import values from 'lodash/values';
 import groupBy from 'lodash/groupBy';
 import mapValues from 'lodash/mapValues';
 import { onMount } from 'svelte';
 import 'autocompleter/autocomplete.css';
 import { currentApp } from './stores'

 let apps = {};
 export let selectedApp = () => null;

 onMount(async () => {
   var input = document.getElementById("appSearch");
   autocomplete({
     input: input,
     fetch: async function(text, update) {
       text = text.toLowerCase();
       let formattedText = encodeURI(text);

       let cacheApps = values(apps).map(a => ({value: a.id , label: a.name}));
       update(cacheApps);

       let res = await fetch(`https://cors.io/?https://itunes.apple.com/search?term=${formattedText}&entity=software`);
       let appsResponse = await res.json();

       let formattedApps = appsResponse.results.map(a=> ({id: a.trackId, name:a.trackName, link: a.trackViewUrl, currentVersionRatingCount: a.userRatingCountForCurrentVersion, currentVersionRating: a.averageUserRatingForCurrentVersion, appRating: a.averageUserRating, appRatingCount: a.userRatingCount, appPrice:a.formattedPrice}));
       apps = mapValues(groupBy(formattedApps,'id'),x=>x[0]);

       let labelApps = values(apps).map(a => ({value: a.id , label: a.name}));
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
