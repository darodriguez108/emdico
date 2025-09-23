document.addEventListener('DOMContentLoaded', function () {
	const menu = document.querySelector('.menu');
	if (!menu) return;

	const links = Array.from(menu.querySelectorAll('a'));

	// Click handling: keep existing behavior (highlight on click)
	menu.addEventListener('click', function (e) {
		const link = e.target.closest('a');
		if (!link || !menu.contains(link)) return;

		// remove active from all menu links
		links.forEach(l => {
			l.classList.remove('active');
			l.removeAttribute('aria-current');
		});

		// add active to clicked link
		link.classList.add('active');
		link.setAttribute('aria-current', 'page');
	});

	// Helper: activate a single link (by href) and deactivate others
	function activateLinkForHash(hash) {
		if (!hash) return;
		const target = links.find(l => l.getAttribute('href') === hash);
		if (!target) return;
		links.forEach(l => {
			l.classList.remove('active');
			l.removeAttribute('aria-current');
		});
		target.classList.add('active');
		// accessibility: mark as current page/section
		target.setAttribute('aria-current', 'page');
	}

	// Set initial active based on hash (if present)
	if (location.hash) {
		activateLinkForHash(location.hash);
	}

	// NEW: Deterministic scroll-based highlighting (replaces IntersectionObserver to fix skipped section & lingering active)
	const sectionIds = links
		.map(l => l.getAttribute('href'))
		.filter(h => h && h.startsWith('#'))
		.map(h => h.slice(1));

	const sections = sectionIds
		.map(id => document.getElementById(id))
		.filter(Boolean);

	if (sections.length === 0) return;

	const header = document.querySelector('header');
	const headerHeight = header ? header.getBoundingClientRect().height : 76;
	let lastActiveId = null;

	function updateActiveByScroll() {
		// We activate a section when the scroll position (top of viewport below fixed header)
		// has passed (sectionTop - 200px). This gives an early highlight 200px before
		// the section actually reaches the top.
		const scrollPos = window.scrollY + headerHeight; // top edge below fixed header
		let currentSection = sections[0];
		for (const s of sections) {
			const activationPoint = s.offsetTop - 200; // 200px early activation
			if (scrollPos >= activationPoint) {
				currentSection = s;
			} else {
				break; // sections are in DOM order; stop once threshold not met
			}
		}
		// Bottom of page safeguard
		if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
			currentSection = sections[sections.length - 1];
		}
		if (currentSection && currentSection.id !== lastActiveId) {
			links.forEach(l => {
				l.classList.remove('active');
				l.removeAttribute('aria-current');
			});
			const activeLink = links.find(l => l.getAttribute('href') === '#' + currentSection.id);
			if (activeLink) {
				activeLink.classList.add('active');
				activeLink.setAttribute('aria-current', 'page');
				lastActiveId = currentSection.id;
			}
		}
	}

	// Scroll listener with rAF throttle
	let scrollTicking = false;
	window.addEventListener('scroll', () => {
		if (!scrollTicking) {
			scrollTicking = true;
			requestAnimationFrame(() => {
				updateActiveByScroll();
				scrollTicking = false;
			});
		}
	}, { passive: true });

	// Initial sync (after layout)
	requestAnimationFrame(updateActiveByScroll);
});
