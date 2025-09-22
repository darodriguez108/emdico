document.addEventListener('DOMContentLoaded', function () {
	const menu = document.querySelector('.menu');
	if (!menu) return;

	menu.addEventListener('click', function (e) {
		const link = e.target.closest('a');
		if (!link || !menu.contains(link)) return;

		// remove active from all menu links
		menu.querySelectorAll('a').forEach(l => l.classList.remove('active'));

		// add active to clicked link
		link.classList.add('active');
	});

	// Optional: set initial active based on current hash or pathname (useful on page load)
	const currentHref = location.hash || location.pathname || null;
	if (currentHref) {
		const initial = menu.querySelector(`a[href="${currentHref}"]`);
		if (initial) {
			menu.querySelectorAll('a').forEach(l => l.classList.remove('active'));
			initial.classList.add('active');
		}
	}
});
