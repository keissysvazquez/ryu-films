// SELECTED WORK: the single source for every video on the site. Edit this list to add,
// remove or reorder videos; no layout code needs to change. The first video (after
// filtering) is shown as the large featured card.
//
// Fields
//   title        (required) Shown under the card and in the player.
//   artist       Artist or client name, shown in small gold capitals above the title.
//   category     (required) "Music Videos", "Brand Films" or "Aerial". Filter tabs are built from
//                the categories used here; a category with no videos gets no tab.
//   instagramUrl Instagram post, reel or IGTV URL.
//   coverImage   (optional) Path to a still. Cropped to fill a 16:9 frame. Leave '' for an
//                elegant placeholder card.
//   coverPosition (optional) CSS object-position for the crop, e.g. '50% 20%'.
//   year         (optional) e.g. '2025'.
//   videoUrl     (optional) Overrides instagramUrl as the playable source: a Vimeo page URL or a
//                direct MP4/WebM URL. instagramUrl is still used for "View on Instagram".
window.RYU_VIDEOS = [
  {
    title: 'Time to Get Back to Work',
    artist: 'RYU Films',
    category: 'Brand Films',
    instagramUrl: 'https://www.instagram.com/reel/C6msNW1Ol1A/',
    coverImage: 'assets/ig-C6msNW1Ol1A.jpg',
    coverPosition: '50% 78%',
    year: ''
  },
  {
    title: 'I Swear',
    artist: 'Cipherella',
    category: 'Music Videos',
    instagramUrl: 'https://www.instagram.com/tv/CYDXCoorQAi/',
    coverImage: 'assets/ig-CYDXCoorQAi.jpg',
    year: ''
  },
  {
    title: 'For Me',
    artist: 'Pyrotraxx',
    category: 'Music Videos',
    instagramUrl: 'https://www.instagram.com/tv/CXOVGRmvPZn/',
    coverImage: 'assets/ig-CXOVGRmvPZn.jpg',
    year: ''
  },
  {
    title: 'I’m From New York',
    artist: 'A1 Righteous',
    category: 'Music Videos',
    instagramUrl: 'https://www.instagram.com/p/CTXWu_Jn6Gn/',
    coverImage: 'assets/IMG_2675.jpeg',
    year: ''
  },
  {
    title: 'Untitled Music Video',
    artist: 'Kay-Dot Almighty',
    category: 'Music Videos',
    instagramUrl: 'https://www.instagram.com/p/COgpL9Cj-B-/',
    coverImage: 'assets/ig-COgpL9Cj-B-.jpg',
    coverPosition: '50% 60%',
    year: ''
  },
  {
    title: 'Bronx Dreamin’',
    artist: 'Finesse Parlay',
    category: 'Music Videos',
    instagramUrl: 'https://www.instagram.com/p/CNamRogD2bU/',
    coverImage: 'assets/ig-CNamRogD2bU.jpg',
    coverPosition: '50% 35%',
    year: ''
  },
  {
    title: 'Solo',
    artist: 'True Da Homie',
    category: 'Music Videos',
    instagramUrl: 'https://www.instagram.com/p/CLAnbxzjLvC/',
    coverImage: 'assets/ig-CLAnbxzjLvC.jpg',
    year: ''
  },
  {
    title: 'Aerial Reel',
    artist: 'RYU Films',
    category: 'Aerial',
    instagramUrl: 'https://www.instagram.com/p/CCUB4MHjQye/',
    coverImage: 'assets/IMG_2663.jpeg',
    year: ''
  },
  {
    title: 'No Favors',
    artist: 'SVCIA',
    category: 'Music Videos',
    instagramUrl: 'https://www.instagram.com/p/B0LULHkjzhZ/',
    coverImage: 'assets/IMG_2669.jpeg',
    coverPosition: '50% 40%',
    year: ''
  }
];
