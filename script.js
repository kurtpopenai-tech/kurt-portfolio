const revealElements = document.querySelectorAll('.reveal');
const youtubeShowcase = document.getElementById('youtube-showcase');
const youtubeHint = document.getElementById('youtube-hint');

const youtubeConfig = {
  // Set mode to "latest" to show newest upload from your channel, or "selected" for one video.
  mode: 'selected',
  // Replace with your channel ID (starts with UC...).
  channelId: 'UC0tMepkUsfdbFgnVuT98wFg',
  // Used only when mode is "selected". Supports raw video ID or full YouTube URL.
  videoId: 'MHxleqQirMA'
};

function getVideoId(input) {
  const value = input.trim();

  if (!value) {
    return '';
  }

  const noParams = value.split('?')[0].split('&')[0];
  if (/^[a-zA-Z0-9_-]{11}$/.test(noParams)) {
    return noParams;
  }

  try {
    const normalized = /^(https?:)?\/\//.test(value)
      ? value
      : value.includes('youtube.com') || value.includes('youtu.be')
        ? `https://${value}`
        : value;
    const parsed = new URL(normalized);
    const hostname = parsed.hostname.replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      return parsed.pathname.replace('/', '').slice(0, 11);
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      const watchId = parsed.searchParams.get('v');
      if (watchId) {
        return watchId.slice(0, 11);
      }

      const parts = parsed.pathname.split('/').filter(Boolean);
      const markerIndex = parts.findIndex(part => part === 'shorts' || part === 'embed');
      if (markerIndex !== -1 && parts[markerIndex + 1]) {
        return parts[markerIndex + 1].slice(0, 11);
      }
    }
  } catch {
    return '';
  }

  return '';
}

function appendEmbedParams(baseUrl) {
  const url = new URL(baseUrl);
  url.searchParams.set('rel', '0');
  url.searchParams.set('modestbranding', '1');
  url.searchParams.set('playsinline', '1');
  if (window.location.protocol.startsWith('http')) {
    url.searchParams.set('origin', window.location.origin);
  }
  return url.toString();
}

function buildYouTubeEmbedUrl(config) {
  if (config.mode === 'selected') {
    const id = getVideoId(config.videoId);
    if (id) {
      return appendEmbedParams(`https://www.youtube.com/embed/${id}`);
    }
  }

  if (config.mode === 'latest' && config.channelId.startsWith('UC')) {
    const uploadsPlaylistId = `UU${config.channelId.slice(2)}`;
    return appendEmbedParams(`https://www.youtube.com/embed/videoseries?list=${uploadsPlaylistId}`);
  }

  return '';
}

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: '0px 0px -8% 0px'
  }
);

revealElements.forEach((element, index) => {
  element.style.transitionDelay = `${index * 70}ms`;
  observer.observe(element);
});

if (youtubeShowcase) {
  const embedUrl = buildYouTubeEmbedUrl(youtubeConfig);
  if (embedUrl) {
    youtubeShowcase.src = embedUrl;
  }
}

if (youtubeHint && window.location.protocol === 'file:') {
  youtubeHint.hidden = false;
  youtubeHint.textContent =
    'For YouTube embeds to load reliably, open this site at http://localhost (not directly as a file).';
}

document.getElementById('year').textContent = new Date().getFullYear();
