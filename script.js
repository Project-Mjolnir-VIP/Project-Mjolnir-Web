/* --- STORIES SCROLL CONTROL & PROGRESS BAR --- */
function scrollStories(direction) {
    const track = document.getElementById('storiesTrack');
    if (track) {
        track.scrollBy({ left: direction * 440, behavior: 'smooth' });
    }
}

function updateStoriesProgress() {
    const track = document.getElementById('storiesTrack');
    const progressBar = document.getElementById('storiesProgressBar');
    if (track && progressBar) {
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (maxScroll > 0) {
            const progress = (track.scrollLeft / maxScroll) * 100;
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        } else {
            progressBar.style.width = '100%';
        }
    }
}

/* --- 1. FEATURE BREAKDOWN HOTSPOT & RESPONSIVE LOGIC --- */
let currentIdx = 0;

function prevHotspot() {
    currentIdx = (currentIdx - 1 + 4) % 4;
    renderHotspot();
}

function nextHotspot() {
    currentIdx = (currentIdx + 1) % 4;
    renderHotspot();
}

function selectHotspot(id) {
    currentIdx = id - 1;
    renderHotspot();
}

function renderHotspot(shouldScroll = true) {
    // 1. Update active pin indicator on canvas/mini-map
    [1, 2, 3, 4].forEach(i => {
        const pin = document.getElementById(`hotspot-pin-${i}`);
        if (pin && pin.parentElement) {
            pin.parentElement.classList.toggle('active', i === (currentIdx + 1));
        }
    });

    // 2. Update active feature card state
    [1, 2, 3, 4].forEach(i => {
        const card = document.getElementById(`feature-card-${i}`);
        if (card) {
            card.classList.toggle('active', i === (currentIdx + 1));
        }
    });

    // 3. Scroll ONLY the horizontal track (never the whole window)
    if (shouldScroll && window.innerWidth < 1024) {
        const track = document.getElementById('featuresTrack');
        const activeCard = document.getElementById(`feature-card-${currentIdx + 1}`);
        if (track && activeCard) {
            track.scrollTo({
                left: activeCard.offsetLeft - track.offsetLeft,
                behavior: 'smooth'
            });
        }
    }
}

function updateFeaturesProgress() {
    const track = document.getElementById('featuresTrack');
    const progressBar = document.getElementById('featuresProgressBar');
    
    if (track && progressBar && window.innerWidth < 1024) {
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (maxScroll > 0) {
            const progress = (track.scrollLeft / maxScroll) * 100;
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        } else {
            progressBar.style.width = '100%';
        }

        // Sync pin highlights with manual touch scrolling
        const cards = track.querySelectorAll('.feature-card');
        const trackCenter = track.scrollLeft + track.clientWidth / 2;
        cards.forEach((card, idx) => {
            const cardLeft = card.offsetLeft;
            const cardRight = cardLeft + card.offsetWidth;
            if (trackCenter >= cardLeft && trackCenter <= cardRight) {
                currentIdx = idx;
                [1, 2, 3, 4].forEach(i => {
                    const pin = document.getElementById(`hotspot-pin-${i}`);
                    if (pin && pin.parentElement) {
                        if (i === (idx + 1)) {
                            pin.parentElement.classList.add('active');
                        } else {
                            pin.parentElement.classList.remove('active');
                        }
                    }
                });
            }
        });
    }
}

/* --- 2. UNIVERSAL STICKY TIMELINE & SMOOTH PARALLAX LOGIC --- */
let currentX = 0;
let targetX = 0;
let isAnimationActive = false;

function calculateTimelineTarget() {
    const timelineSection = document.getElementById('process');
    const stickyWrapper = timelineSection ? timelineSection.querySelector('.timeline-sticky-wrapper') : null;
    const timelineTrack = document.getElementById('timelineTrack');
    const progressBar = document.getElementById('timelineProgressBar');
    const cards = document.querySelectorAll('.timeline-card-wrapper');

    if (!timelineSection || !stickyWrapper || !timelineTrack || cards.length === 0) return;

    const rect = timelineSection.getBoundingClientRect();
    const stickyHeight = stickyWrapper.offsetHeight;
    const scrollDistance = timelineSection.offsetHeight - stickyHeight;

    if (scrollDistance <= 0) return;

    const headerOffset = document.querySelector('.header')?.offsetHeight || 80;
    let scrolled = headerOffset - rect.top;
    let progress = scrolled / scrollDistance;
    progress = Math.max(0, Math.min(1, progress));

    const firstCard = cards[0];
    const lastCard = cards[cards.length - 1];
    const maxTranslate = lastCard.offsetLeft - firstCard.offsetLeft;

    targetX = progress * maxTranslate;

    if (progressBar) {
        progressBar.style.width = `${progress * 100}%`;
    }

    const nodes = document.querySelectorAll('.timeline-node');
    const activeIdx = Math.min(cards.length - 1, Math.round(progress * (cards.length - 1)));
    nodes.forEach((node, idx) => {
        if (idx === activeIdx) {
            node.classList.add('active');
        } else {
            node.classList.remove('active');
        }
    });

    if (!isAnimationActive) {
        isAnimationActive = true;
        requestAnimationFrame(renderTimelineAnimation);
    }
}

function renderTimelineAnimation() {
    const timelineTrack = document.getElementById('timelineTrack');
    const cards = document.querySelectorAll('.timeline-card-wrapper');
    if (!timelineTrack) return;

    const ease = 0.08;
    currentX += (targetX - currentX) * ease;

    timelineTrack.style.transform = `translate3d(-${currentX}px, 0, 0)`;

    const containerPaddingLeft = parseFloat(getComputedStyle(timelineTrack).paddingLeft) || 24;
    cards.forEach((card) => {
        const img = card.querySelector('.timeline-card-image');
        if (img) {
            const cardCurrentLeft = card.offsetLeft - currentX;
            const relativeOffset = cardCurrentLeft - containerPaddingLeft;
            img.style.transform = `translate3d(${ -relativeOffset * 0.1 }px, 0, 0) scale(1.15)`;
        }
    });

    if (Math.abs(targetX - currentX) > 0.05) {
        requestAnimationFrame(renderTimelineAnimation);
    } else {
        isAnimationActive = false;
    }
}

function scrollToPhase(index) {
    const timelineSection = document.getElementById('process');
    const stickyWrapper = timelineSection ? timelineSection.querySelector('.timeline-sticky-wrapper') : null;
    if (!timelineSection || !stickyWrapper) return;

    const cards = document.querySelectorAll('.timeline-card-wrapper');
    const totalCards = cards.length;
    const scrollDistance = timelineSection.offsetHeight - stickyWrapper.offsetHeight;
    const targetProgress = index / (totalCards - 1);
    
    const sectionTop = timelineSection.getBoundingClientRect().top + window.scrollY;
    const headerOffset = document.querySelector('.header')?.offsetHeight || 80;
    const targetScrollY = (sectionTop - headerOffset) + (targetProgress * scrollDistance);

    window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
}

/* --- 3. FAQ ACCORDION LOGIC --- */
function toggleFaq(btn) {
    const body = btn.nextElementSibling;
    if (body) body.classList.toggle('hidden');
}

/* --- 4. MODALS & NAV LOGIC --- */
function toggleMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) mobileNav.classList.toggle('active');
}

function openBuildModal() {
    const modal = document.getElementById('buildModal');
    if (modal) modal.classList.remove('hidden');
}

function closeBuildModal() {
    const modal = document.getElementById('buildModal');
    if (modal) modal.classList.add('hidden');
}

function openContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) modal.classList.remove('hidden');
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) modal.classList.add('hidden');
}

// Global Event Listeners
window.addEventListener('scroll', calculateTimelineTarget, { passive: true });
window.addEventListener('resize', () => {
    calculateTimelineTarget();
    renderHotspot(false);
});

window.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        try { lucide.createIcons(); } catch (err) { console.warn(err); }
    }
    
    const storiesTrack = document.getElementById('storiesTrack');
    if (storiesTrack) {
        storiesTrack.addEventListener('scroll', updateStoriesProgress, { passive: true });
        updateStoriesProgress();
    }

    const featuresTrack = document.getElementById('featuresTrack');
    if (featuresTrack) {
        featuresTrack.addEventListener('scroll', updateFeaturesProgress, { passive: true });
        updateFeaturesProgress();
    }

    renderHotspot(false);
    calculateTimelineTarget();
});