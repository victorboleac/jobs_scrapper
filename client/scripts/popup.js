// creaza link pentru Indeed
function createIndeedUrl(keywords, location, radius) {
    const indeedUrl = "https://uk.indeed.com/jobs?";
    const keywordParam = `q=${keywords.join('+')}`;
    const locationParam = `l=${location}`;
    const radiusParam = `radius=${radius}`;
    return `${indeedUrl}${keywordParam}&${locationParam}&${radiusParam}&sort=date`;
}
// creaza link pentru CV-Library
function createCVLibraryUrl(keywords, location, radius) {
    const cvLibraryUrl = "https://www.cv-library.co.uk/";
    const keywordParam = `${keywords.join('-')}`;
    const locationParam = `-jobs-in-${location}`;
    const radiusParam = `?distance=${radius}`;
    const orderParam = `order=date`;
    const perPageParam = `perpage=25`;
    return `${cvLibraryUrl}${keywordParam}${locationParam}${radiusParam}&${orderParam}&${perPageParam}&us=1`;
}
// creaza link pentru Gov.uk
function createGovJobsUrl(keywords, location, radius) {
    const govJobsUrl = "https://findajob.dwp.gov.uk/search?adv=1&";
    const keywordParam = `qph=${keywords.join('%20')}`;
    const locationParam = `w=${location}`;
    const radiusParam = `d=${radius}`;
    const perpage = `pp=25`;
    const orderParam = `sb=date`;
    return `${govJobsUrl}${keywordParam}&${locationParam}&${radiusParam}&${perpage}&${orderParam}&sd=down`;
}
document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');

    stopButton.addEventListener('click', function() {
        chrome.storage.sync.set({ status: 'stopped' });
       
    });

    startButton.addEventListener('click', function() {
        // drop all sync storage
        chrome.storage.sync.clear();
        // Extract selected radio button
        const siteRadios = document.getElementsByName('site');
        let selectedSite = null;
        for (const radio of siteRadios) {
            if (radio.checked) {
                selectedSite = radio.value;
                break;
            }
        }

        // Extract selected keywords
        const keywordCheckboxes = document.querySelectorAll('.keywords input[type="checkbox"]');
        const selectedKeywords = Array.from(keywordCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        // Extract additional custom keywords
        const customKeywordsInput = document.getElementById('customKeywords');
        let customKeywords = customKeywordsInput.value
            .trim()
            .split(';')
            .map(keyword => keyword.trim());
        // remove empty keywords
        customKeywords = customKeywords.filter(keyword => keyword !== '');

        // Combine selected keywords with custom keywords
        const allKeywords = [...selectedKeywords, ...customKeywords];

        // Extract location and radius
        const locationInput = document.getElementById('locationInput').value.trim();
        const radiusInput = document.getElementById('radiusInput').value.trim();

        // Generate links for each keyword based on the selected site
        const links = [];
        switch (selectedSite) {
            case 'indeed':
                links.push(...allKeywords.map(keyword => createIndeedUrl([keyword], locationInput, radiusInput)));
                break;
            case 'glassdoor':
                links.push(...allKeywords.map(keyword => createGlassdoorUrl([keyword], locationInput, radiusInput)));
                break;
            case 'cvlibrary':
                links.push(...allKeywords.map(keyword => createCVLibraryUrl([keyword], locationInput, radiusInput)));
                break;
            case 'govuk':
                links.push(...allKeywords.map(keyword => createGovJobsUrl([keyword], locationInput, radiusInput)));
                break;
            default:
                console.error('Invalid site selected');
                break;
        }

        // save link to storage
        chrome.storage.sync.set({ links: links });
        chrome.storage.sync.set({ status: 'running' });
        chrome.storage.sync.set({ currentLink: 1 });
        chrome.tabs.update({ url: links[0] });
    });
});

