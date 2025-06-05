const API_KEY = "AIzaSyBNetz_8Hhm9j4wpmssxf6ReE6X9hoGiNU";
const SEARCH_ENGINE_ID = "8774c779014954b77"; 
const DEFAULT_SEARCH_QUERY = "breakcore art";
const NUM_RESULTS = 10; // Maximum allowed by free tier


/**
 * Fetch images from Google Custom Search API
 * @returns {Promise} Promise resolving to image results
 */
export async function fetchSasukeImages(SEARCH_QUERY = DEFAULT_SEARCH_QUERY, SITE_RESTRICT = false, WEB = false, YT = false) {
  const baseUrl = "https://www.googleapis.com/customsearch/v1";
  
  
  const paramObj = {
    key: API_KEY,
    cx: SEARCH_ENGINE_ID,
    q: SEARCH_QUERY,
    num: NUM_RESULTS
  };

  // Add thumbnail and org src link 
  


// Add weblink restriction if enabled 
  if (!WEB) {
    paramObj.searchType = "image"; // Images only
    console.log("🖼️ IMAGE SEARCH MODE");
  }
  else {
    console.log("🌐 WEB SEARCH MODE");
  }

  // Add site restriction if enabled
  if (SITE_RESTRICT) {
    paramObj.siteSearch = "pinterest.com"; // Add to the regular object
    console.log("🔍 PINTEREST SEARCH ENABLED - siteSearch:", paramObj.siteSearch);
  } 

  if (YT) {
    paramObj.siteSearch = "youtube.com"; // Add to the regular object
    console.log("🔍 YOUTUBE SEARCH ENABLED - siteSearch:", paramObj.siteSearch);
  } 

  

  // add webpage link restriction if enabled 
  
  console.log("🏗️ Param Object:", paramObj); // Debug: check the object before URLSearchParams
  

    
  try {
    const url = new URL(baseUrl);
    Object.keys(paramObj).forEach(key => url.searchParams.append(key, paramObj[key]));
    
    console.log("🔗 Request URL:", url.toString());
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Raw API response data:", data);

    if (WEB && YT) {
      // Return web page results with constructed thumbnails
      return data.items?.map(item => {
        // Extract video ID from YouTube URL
        const videoId = item.link.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        
        return {
          title: item.title,
          link: item.link,
          thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null,
          snippet: item.snippet,
          displayLink: item.displayLink
        };
      }) || [];
    }
    
    
    else if (WEB) {
      // Return web page results
      return data.items?.map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink
      })) || [];
    } else {
      // Return image results (your existing format)
      return data.items?.map(item => ({
        title: item.title,
        link: item.link,
        image: item.image,
        contextLink: item.image?.contextLink
      })) || [];
    }
    
  } catch (error) {
    console.error("❌ Search failed:", error);
    return [];
  }
}


/**
 * Process the API response to extract image information
 * @param {Object} data - API response data
 * @returns {Array} Array of processed image objects
 */
export function processImageResults(data) {
  if (!data.items || data.items.length === 0) {
    console.warn("No image results found");
    return [];
  }
  
  return data.items.map(item => ({
    title: item.title,
    link: item.image?.thumbnailLink || item.link,
    thumbnail: item.image.thumbnailLink,
    context: item.image.contextLink,
    width: item.image.width,
    height: item.image.height
  }));
}

/**
 * Main function to search for images
 * Browser-compatible version (no file system operations)
 */
export async function searchAndSaveImages(searchQuery = DEFAULT_SEARCH_QUERY, siteRestrict = false, WEB = false, YT= false) {
  try {
    console.log(`Searching for "${searchQuery}" images...`);
    const images = await fetchSasukeImages(searchQuery, siteRestrict, WEB, YT);
    console.log(`Searching for "${searchQuery}" ${WEB ? 'web pages' : 'images'}...`);
    return images;
  } catch (error) {
    console.error("Search operation failed:", error);
    throw error;
  }
}