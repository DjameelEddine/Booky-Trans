// Simpler, human-friendly interactions for the translation page.
document.addEventListener('DOMContentLoaded', () => {
	// --- icons ---
	const icons = {
		edit: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21V16.75L16.2 3.575C16.4 3.39167 16.621 3.25 16.863 3.15C17.105 3.05 17.359 3 17.625 3C17.891 3 18.1493 3.05 18.4 3.15C18.6507 3.25 18.8673 3.4 19.05 3.6L20.425 5C20.625 5.18333 20.771 5.4 20.863 5.65C20.955 5.9 21.0007 6.15 21 6.4C21 6.66667 20.9543 6.921 20.863 7.163C20.7717 7.405 20.6257 7.62567 20.425 7.825L7.25 21H3ZM17.6 7.8L19 6.4L17.6 5L16.2 6.4L17.6 7.8Z" fill="currentColor"/></svg>',
		delete: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 4H15.5L14.5 3H9.5L8.5 4H5V6H19M6 19C6 19.5304 6.21071 20.0391 6.58579 20.4142C6.96086 20.7893 7.46957 21 8 21H16C16.5304 21 17.0391 20.7893 17.4142 20.4142C17.7893 20.0391 18 19.5304 18 19V7H6V19Z" fill="currentColor"/></svg>',
		send: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.9136 13.0853C10.7224 12.8945 10.4947 12.7444 10.244 12.6441L2.31399 9.46406C2.21931 9.42606 2.13851 9.36002 2.08245 9.27478C2.02638 9.18955 1.99773 9.0892 2.00035 8.98722C2.00296 8.88523 2.03671 8.78648 2.09706 8.70423C2.15741 8.62197 2.24148 8.56015 2.33799 8.52706L21.338 2.02706C21.4266 1.99505 21.5225 1.98894 21.6144 2.00945C21.7064 2.02995 21.7906 2.07622 21.8572 2.14283C21.9238 2.20945 21.9701 2.29366 21.9906 2.38561C22.0111 2.47756 22.005 2.57345 21.973 2.66206L15.473 21.6621C15.4399 21.7586 15.3781 21.8426 15.2958 21.903C15.2136 21.9633 15.1148 21.9971 15.0128 21.9997C14.9108 22.0023 14.8105 21.9737 14.7253 21.9176C14.64 21.8615 14.574 21.7807 14.536 21.6861L11.356 13.7541C11.2552 13.5036 11.1047 13.2761 10.9136 13.0853ZM10.9136 13.0853L21.854 2.14706" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
	};

	// Simple helpers
	const $ = (s, root = document) => root.querySelector(s);
	const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
	const escape = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

	// Try to find a username on the page, default to "You"
	const userEl = document.querySelector('[data-username], .profile-name, .user-name, #username, [data-user-name]');
	const USERNAME = userEl ? userEl.textContent.trim() : 'You';

	// Build a comment DOM node from author + text
	function makeComment(author, text) {
		const item = document.createElement('div');
		item.className = 'comment-item';
		item.innerHTML = `
			<div class="comment-top">
				<strong class="comment-author">${escape(author)}</strong>
				<div class="comment-actions"></div>
			</div>
			<div class="comment-text">${escape(text)}</div>
			<div class="comment-date">Just now</div>
		`;
		const actions = $('.comment-actions', item);
		actions.appendChild(makeIconButton('comment-edit', icons.edit, 'Edit comment'));
		actions.appendChild(makeIconButton('comment-delete', icons.delete, 'Delete comment'));
		return item;
	}

	function makeIconButton(cls, svg, label) {
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = cls;
		btn.setAttribute('aria-label', label);
		btn.innerHTML = svg;
		return btn;
	}

	// Toggle review/comment UI
	$$('.rate-btn').forEach(btn => btn.addEventListener('click', e => {
		const card = e.target.closest('.translation-card');
		if (!card) return;
		$('.review-form', card)?.classList.toggle('hidden');
		$('.comment-form', card)?.classList.add('hidden');
		$('.comments-list', card)?.classList.add('hidden');
	}));

	$$('.comment-btn').forEach(btn => btn.addEventListener('click', e => {
		const card = e.target.closest('.translation-card');
		if (!card) return;
		$('.review-form', card)?.classList.add('hidden');
		$('.comment-form', card)?.classList.toggle('hidden');
		$('.comments-list', card)?.classList.toggle('hidden');
	}));

	// Star rating (simple)
	$$('.translation-card').forEach(card => {
		const stars = $$('.star', card);
		stars.forEach(s => s.addEventListener('click', () => {
			const v = Number(s.dataset.value || 0);
			stars.forEach(x => x.textContent = Number(x.dataset.value) <= v ? '★' : '☆');
			$('.review-form', card).dataset.value = v;
		}));

		$('.submit-rating', card)?.addEventListener('click', () => {
			const v = $('.review-form', card)?.dataset.value;
			if (!v) return alert('Please select a rating');
			alert(`Rating submitted: ${v} star(s)`);
			$('.review-form', card)?.classList.add('hidden');
		});

		// wire composer send icon
		const sendBtn = $('.submit-comment', card);
		if (sendBtn) sendBtn.innerHTML = icons.send;

		// comment submit
		sendBtn?.addEventListener('click', () => {
			const ta = $('.comment-composer textarea', card);
			if (!ta) return;
			const text = ta.value.trim();
			if (!text) return alert('Please enter a comment');
			const list = $('.comments-list', card);
			const node = makeComment(USERNAME, text);
			if (list) { list.insertBefore(node, list.firstChild); list.classList.remove('hidden'); }
			ta.value = '';
			$('.comment-form', card)?.classList.add('hidden');
		});
	});

	// Delegated click handler for edit/save/cancel/delete
	document.addEventListener('click', (e) => {
		const edit = e.target.closest('.comment-edit');
		const del = e.target.closest('.comment-delete');
		const save = e.target.closest('.comment-save');
		const cancel = e.target.closest('.comment-cancel');

		if (edit) {
			const item = edit.closest('.comment-item');
			const text = $('.comment-text', item).textContent;
			const ta = document.createElement('textarea');
			ta.className = 'comment-edit-area';
			ta.value = text;
			ta.dataset.original = text;
			$('.comment-text', item).replaceWith(ta);
			$('.comment-actions', item).innerHTML = '<button class="comment-save">Save</button><button class="comment-cancel">Cancel</button>';
			return;
		}

		if (save) {
			const item = save.closest('.comment-item');
			const ta = $('.comment-edit-area', item);
			const newText = ta.value.trim();
			const div = document.createElement('div');
			div.className = 'comment-text';
			div.textContent = newText;
			ta.replaceWith(div);
			$('.comment-actions', item).innerHTML = '';
			$('.comment-actions', item).appendChild(makeIconButton('comment-edit', icons.edit, 'Edit comment'));
			$('.comment-actions', item).appendChild(makeIconButton('comment-delete', icons.delete, 'Delete comment'));
			return;
		}

		if (cancel) {
			const item = cancel.closest('.comment-item');
			const ta = $('.comment-edit-area', item);
			const orig = ta.dataset.original || '';
			const div = document.createElement('div');
			div.className = 'comment-text';
			div.textContent = orig;
			ta.replaceWith(div);
			$('.comment-actions', item).innerHTML = '';
			$('.comment-actions', item).appendChild(makeIconButton('comment-edit', icons.edit, 'Edit comment'));
			$('.comment-actions', item).appendChild(makeIconButton('comment-delete', icons.delete, 'Delete comment'));
			return;
		}

		if (del) {
			const item = del.closest('.comment-item');
			if (!confirm('Delete this comment?')) return;
			item.remove();
			return;
		}
	});

});

function toggleMenu(){
	const el = document.getElementById('mobileMenu');
	if (!el) return;
	el.classList.toggle('show');
}
