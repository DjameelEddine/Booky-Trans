
document.addEventListener('DOMContentLoaded', () => {
	// --- icons ---
	const icons = {
		edit: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21V16.75L16.2 3.575C16.4 3.39167 16.621 3.25 16.863 3.15C17.105 3.05 17.359 3 17.625 3C17.891 3 18.1493 3.05 18.4 3.15C18.6507 3.25 18.8673 3.4 19.05 3.6L20.425 5C20.625 5.18333 20.771 5.4 20.863 5.65C20.955 5.9 21.0007 6.15 21 6.4C21 6.66667 20.9543 6.921 20.863 7.163C20.7717 7.405 20.6257 7.62567 20.425 7.825L7.25 21H3ZM17.6 7.8L19 6.4L17.6 5L16.2 6.4L17.6 7.8Z" fill="currentColor"/></svg>',
		delete: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 4H15.5L14.5 3H9.5L8.5 4H5V6H19M6 19C6 19.5304 6.21071 20.0391 6.58579 20.4142C6.96086 20.7893 7.46957 21 8 21H16C16.5304 21 17.0391 20.7893 17.4142 20.4142C17.7893 20.0391 18 19.5304 18 19V7H6V19Z" fill="currentColor"/></svg>',
		send: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.9136 13.0853C10.7224 12.8945 10.4947 12.7444 10.244 12.6441L2.31399 9.46406C2.21931 9.42606 2.13851 9.36002 2.08245 9.27478C2.02638 9.18955 1.99773 9.0892 2.00035 8.98722C2.00296 8.88523 2.03671 8.78648 2.09706 8.70423C2.15741 8.62197 2.24148 8.56015 2.33799 8.52706L21.338 2.02706C21.4266 1.99505 21.5225 1.98894 21.6144 2.00945C21.7064 2.02995 21.7906 2.07622 21.8572 2.14283C21.9238 2.20945 21.9701 2.29366 21.9906 2.38561C22.0111 2.47756 22.005 2.57345 21.973 2.66206L15.473 21.6621C15.4399 21.7586 15.3781 21.8426 15.2958 21.903C15.2136 21.9633 15.1148 21.9971 15.0128 21.9997C14.9108 22.0023 14.8105 21.9737 14.7253 21.9176C14.64 21.8615 14.574 21.7807 14.536 21.6861L11.356 13.7541C11.2552 13.5036 11.1047 13.2761 10.9136 13.0853ZM10.9136 13.0853L21.854 2.14706" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
	};

	//helpers
	const $ = (s, root = document) => root.querySelector(s);
	const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
	const escape = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

	// Ensure user is logged in without forcing immediate redirect.
	// Returns true if authenticated. If not, prompt the user and optionally redirect.
	function ensureLoggedIn() {
		if (isAuthenticated && isAuthenticated()) return true;
		const go = confirm('You must be logged in to perform this action. Go to login page now?');
		if (go) {
			window.location.href = '/frontend/Authentication/Login/login.html';
		}
		return false;
	}


	

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

	// We'll render dynamic translation cards below; placeholders kept for static elements

	// We'll dynamically attach event listeners when rendering cards

	// --- Translation API integration ---
	const bookCard = document.querySelector('.book-card[data-book-id]');
	const translationsList = document.getElementById('translations-list');
	const uploadDrop = document.getElementById('upload-drop');
	const uploadInput = document.getElementById('upload-input');
	const submitUploadBtn = document.querySelector('.submit-translation');

	if (!bookCard) return console.warn('No book card with data-book-id found');

	const BOOK_ID = Number(bookCard.dataset.bookId || 0) || 1;

	let selectedFile = null;

	// favorite (heart) and download original handlers
	const heartIcon = document.querySelector('.heart-icon');
	const downloadOriginalBtn = document.querySelector('.download-btn');

	if (heartIcon) {
		heartIcon.style.cursor = 'pointer';
		heartIcon.addEventListener('click', async () => {
			try {
				const res = await fetch(getApiUrl(`/Books?book_id=${BOOK_ID}`), { method: 'POST' });
				if (!res.ok) return alert('Failed to toggle favorite');
				const data = await res.json();
				if (data.favorited) heartIcon.classList.add('favorited'); else heartIcon.classList.remove('favorited');
			} catch (err) { console.error(err); alert('Failed to toggle favorite'); }
		});
	}

	if (downloadOriginalBtn) {
		downloadOriginalBtn.addEventListener('click', (e) => {
			// attempt a download route; backend may not implement book download
			window.location = getApiUrl(`/Books/download/${BOOK_ID}`);
		});
	}

	uploadDrop?.addEventListener('click', () => uploadInput.click());
	uploadInput?.addEventListener('change', (e) => {
		selectedFile = e.target.files[0];
		if (selectedFile) uploadDrop.innerHTML = `<strong>${escape(selectedFile.name)}</strong>`;
	});

	submitUploadBtn?.addEventListener('click', async () => {
		if (!selectedFile) return alert('Please select a file to upload');
		const user = getStoredUserData();
		if (!user) return requireAuth();

		const fd = new FormData();
		fd.append('book_id', String(BOOK_ID));
		fd.append('user_id', String(user.id));
		fd.append('file', selectedFile);

		try {
			const res = await fetch(getApiUrl(`/Translations/upload`), {
				method: 'POST',
				body: fd
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				return alert(err.detail || 'Upload failed');
			}

			const data = await res.json();
			alert('Upload successful');
			selectedFile = null; uploadInput.value = '';
			uploadDrop.innerHTML = `<img src="../../assets/icons/upload-icon.svg" alt="upload" class="icon" style="width:38px;display:block;margin:0 auto 8px;">Click To Upload your file<br><small>PDF or TXT</small>`;
			loadTranslations();
		} catch (err) {
			console.error(err);
			alert('Upload failed');
		}
	});

	async function loadTranslations() {
		translationsList.innerHTML = '<div class="loading">Loading translations...</div>';
		try {
			const res = await fetch(getApiUrl(`/Translations/book/${BOOK_ID}`));
			if (!res.ok) throw new Error('Failed to load translations');
			const translations = await res.json();
			await renderTranslations(translations);
		} catch (err) {
			console.error(err);
			translationsList.innerHTML = '<div class="error">Could not load translations</div>';
		}
	}

	function computeAvg(reviews){
		if (!reviews || reviews.length === 0) return null;
		const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
		return (sum / reviews.length).toFixed(1);
	}

	async function fetchReviews(translationId){
		try {
			const res = await fetch(getApiUrl(`/Translations/reviews/${translationId}`));
			if (!res.ok) return [];
			return await res.json();
		} catch (e) { return []; }
	}

	function makeTranslationCard(tr, reviews){
		const card = document.createElement('div');
		card.className = 'translation-card';
		card.innerHTML = `
			<div class="avatar"></div>
			<div class="card-body">
				<div class="card-header">
					<div>
						<strong>${escape(tr.user ? tr.user.full_name || ('User ' + tr.user_id) : 'User')}</strong>
						<div class="date">${escape((tr.upload_date || '').toString())}</div>
					</div>
				</div>
				<div class="file-row">
					<div class="file-name">
						<img src="../../assets/icons/file-icon.svg" alt="file" class="file-icon" style="vertical-align:middle;width:22px;margin-right:10px;">
						${escape(tr.file_path ? tr.file_path.split('_').slice(1).join('_') : ('translation_' + tr.id))}
					</div>
					<button class="download small" data-id="${tr.id}">
						<img src="../../assets/icons/download-icon.svg" alt="download" class="icon" style="vertical-align:middle;width:18px;margin-right:6px;">download
					</button>
				</div>
				<div class="rating-row">
					<div class="avg-stars">${computeAvg(reviews) ? '★'.repeat(Math.round(computeAvg(reviews))) : '—'}</div>
					<div class="avg">Avg Rating: ${computeAvg(reviews) || 'N/A'}</div>
					<div class="actions">
						<button class="rate-btn"> <img src="../../assets/icons/rate-icon.svg" style="width:18px;margin-right:4px;"> rate</button>
						<button class="comment-btn"> <img src="../../assets/icons/commet-icon.svg" style="width:18px;margin-right:4px;"> comment</button>
					</div>
				</div>

				<div class="review-form hidden" data-translation-id="${tr.id}">
					<label>Your rating</label>
					<div class="stars">
						<span class="star" data-value="1">★</span>
						<span class="star" data-value="2">★</span>
						<span class="star" data-value="3">★</span>
						<span class="star" data-value="4">★</span>
						<span class="star" data-value="5">☆</span>
					</div>
					<button class="submit-rating">Submit rating</button>
				</div>

			<div class="comment-form hidden" data-translation-id="${tr.id}">
				<label class="sr-only">Add a comment</label>
				<div class="comment-composer" style="display:flex;gap:8px;align-items:flex-end;">
					<textarea rows="2" style="flex:1;resize:vertical;padding:8px;min-height:44px;"></textarea>
					<button class="submit-comment" aria-label="Send" style="background:#000;color:#fff;border:none;padding:6px;cursor:pointer;border-radius:8px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;"> </button>
				</div>
			</div>

				<div class="comments-list hidden"></div>
			</div>
		`;

		// attach listeners
		$('.download', card)?.addEventListener('click', () => {
			window.location = getApiUrl(`/Translations/download/${tr.id}`);
		});

		const rateBtn = $('.rate-btn', card);
		const commentBtn = $('.comment-btn', card);
		const reviewForm = $('.review-form', card);
		const commentForm = $('.comment-form', card);

		rateBtn?.addEventListener('click', () => {
			reviewForm.classList.toggle('hidden');
			commentForm.classList.add('hidden');
		});

		commentBtn?.addEventListener('click', async () => {
			const wasHidden = commentForm.classList.contains('hidden');
			commentForm.classList.toggle('hidden');
			reviewForm.classList.add('hidden');
			const commentsList = $('.comments-list', card);
			// When opening the comment form, load comments
			if (wasHidden && !commentForm.classList.contains('hidden')) {
				commentsList.classList.remove('hidden');
				commentsList.innerHTML = '<div class="loading">Loading reviews...</div>';
				const reviews = await fetchReviews(tr.id);
				commentsList.innerHTML = '';
				if (!reviews || reviews.length === 0) {
					commentsList.innerHTML = '<div class="no-comments">No reviews yet</div>';
				} else {
					const storedUser = getStoredUserData();
					for (const r of reviews) {
						const item = document.createElement('div');
						item.className = 'comment-item';
						item.dataset.reviewId = r.id;
						item.innerHTML = `<div class="comment-top"><strong class="comment-author">${escape(r.user_full_name || ('User ' + r.user_id))}</strong><div class="comment-actions"></div></div><div class="comment-text">${escape(r.comment || '')}</div><div class="comment-date">${escape((r.date_issued||'').toString())}</div>`;
						const actions = $('.comment-actions', item);
						if (storedUser && storedUser.id === r.user_id) {
							actions.appendChild(makeIconButton('comment-edit', icons.edit, 'Edit comment'));
							actions.appendChild(makeIconButton('comment-delete', icons.delete, 'Delete comment'));
						}
						commentsList.appendChild(item);
					}
				}
			}
		});

		// stars logic
		const stars = $$('.star', card);
		stars.forEach(s => s.addEventListener('click', () => {
			const v = Number(s.dataset.value || 0);
			stars.forEach(x => x.textContent = Number(x.dataset.value) <= v ? '★' : '☆');
			reviewForm.dataset.value = v;
		}));

		$('.submit-rating', card)?.addEventListener('click', async () => {
			const v = reviewForm.dataset.value;
			if (!v) return alert('Please select a rating');
			try {
				if (!ensureLoggedIn()) return;
				const payload = {
					translation_id: tr.id,
					date_issued: new Date().toISOString().slice(0,10),
					rating: Number(v),
					comment: null
				};
				const url = getApiUrl('/Reviews/review');
				console.debug('Posting rating', { url, payload, auth: getAuthHeader() });
				const res = await authenticatedFetch(url, {
					method: 'POST',
					body: JSON.stringify(payload)
				});
				console.debug('Rating response', res.status);
				if (!res.ok) {
					const err = await res.json().catch(()=>({}));
					return alert(err.detail || 'Failed to submit review');
				}
				alert('Rating submitted');
				loadTranslations();
			} catch (err) { console.error('Submit rating error', err); alert(err && err.message ? err.message : 'Failed to submit rating'); }
		});

		// make submit-comment an icon button and attach handler
		const submitCommentBtn = $('.submit-comment', card);
		if (submitCommentBtn) submitCommentBtn.innerHTML = icons.send;

		submitCommentBtn?.addEventListener('click', async () => {
			const ta = $('.comment-composer textarea', card);
			if (!ta) return;
			const text = ta.value.trim();
			if (!text) return alert('Please enter a comment');
			try {
				const user = getStoredUserData();
				// require authentication for posting comments
				if (!ensureLoggedIn()) return;
				const payload = { translation_id: tr.id, date_issued: new Date().toISOString().slice(0,10), rating: 5, comment: text };
				const url = getApiUrl('/Reviews/review');
				console.debug('Posting comment', { url, payload, auth: getAuthHeader() });
				const res = await authenticatedFetch(url, {
					method: 'POST',
					body: JSON.stringify(payload)
				});
				console.debug('Comment response', res.status);
				if (!res.ok) { const err = await res.json().catch(()=>({})); return alert(err.detail || 'Failed to submit comment'); }
				alert('Comment submitted');
				// refresh just this card's comment list if it's visible
				const commentsList = $('.comments-list', card);
				if (!commentsList.classList.contains('hidden')) {
					commentsList.innerHTML = '<div class="loading">Loading reviews...</div>';
					const reviews = await fetchReviews(tr.id);
					commentsList.innerHTML = '';
					if (!reviews || reviews.length === 0) {
						commentsList.innerHTML = '<div class="no-comments">No reviews yet</div>';
					} else {
						const storedUser = getStoredUserData();
						for (const r of reviews) {
							const item = document.createElement('div');
							item.className = 'comment-item';
							item.dataset.reviewId = r.id;
							item.innerHTML = `<div class="comment-top"><strong class="comment-author">${escape(r.user_full_name || ('User ' + r.user_id))}</strong><div class="comment-actions"></div></div><div class="comment-text">${escape(r.comment || '')}</div><div class="comment-date">${escape((r.date_issued||'').toString())}</div>`;
							const actions = $('.comment-actions', item);
							if (storedUser && storedUser.id === r.user_id) {
								actions.appendChild(makeIconButton('comment-edit', icons.edit, 'Edit comment'));
								actions.appendChild(makeIconButton('comment-delete', icons.delete, 'Delete comment'));
							}
							commentsList.appendChild(item);
						}
					}
				}
				ta.value = '';
				commentForm.classList.add('hidden');
			} catch (err) { console.error(err); alert('Failed to submit comment'); }
		});

		return card;
	}

	async function renderTranslations(translations){
		translationsList.innerHTML = '';
		if (!translations || translations.length === 0) {
			translationsList.innerHTML = '<div class="empty">No translations yet</div>';
			return;
		}

		// show newest translations first (assumes higher id is newer)
		translations.sort((a,b) => (b.id || 0) - (a.id || 0));

		for (const tr of translations) {
			// fetch reviews for this translation so we can compute avg rating
			const reviews = await fetchReviews(tr.id);
			const card = makeTranslationCard(tr, reviews);
			translationsList.appendChild(card);
			// ensure the send icon is shown on the submit button and the textarea stays on the same row
			const sendBtn = card.querySelector('.submit-comment');
			if (sendBtn) sendBtn.innerHTML = icons.send;
		}
	}

	// initial load
	loadTranslations();


	document.addEventListener('click', async (e) => {
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
				if (!newText) return alert('Comment cannot be empty');
				const reviewId = item.dataset.reviewId;
				try {
					// call backend to update review (requires auth)
					const res = await authenticatedFetch(getApiUrl(`/Reviews/${reviewId}`), {
						method: 'PUT',
						body: JSON.stringify({ comment: newText })
					});
					if (!res.ok) {
						const err = await res.json().catch(()=>({}));
						return alert(err.detail || 'Failed to save comment. Please try again later.');
					}
					const div = document.createElement('div');
					div.className = 'comment-text';
					div.textContent = newText;
					ta.replaceWith(div);
					$('.comment-actions', item).innerHTML = '';
					$('.comment-actions', item).appendChild(makeIconButton('comment-edit', icons.edit, 'Edit comment'));
					$('.comment-actions', item).appendChild(makeIconButton('comment-delete', icons.delete, 'Delete comment'));
				} catch (err) {
					console.error(err);
					alert('An error occurred while saving the comment. Please check your connection and try again.');
				}
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
				const reviewId = item.dataset.reviewId;
				if (!confirm('Delete this comment?')) return;
				try {
					const res = await authenticatedFetch(getApiUrl(`/Reviews/${reviewId}`), { method: 'DELETE' });
					if (!res.ok) {
						const err = await res.json().catch(()=>({}));
						return alert(err.detail || 'Failed to delete comment. Please try again later.');
					}
					item.remove();
				} catch (err) {
					console.error(err);
					alert('An error occurred while deleting the comment. Please check your connection and try again.');
				}
				return;
		}
	});

});

function toggleMenu(){
	const el = document.getElementById('mobileMenu');
	if (!el) return;
	el.classList.toggle('show');
}
