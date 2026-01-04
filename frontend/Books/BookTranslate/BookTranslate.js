
document.addEventListener('DOMContentLoaded', () => {

	const icons = {
		edit: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21V16.75L16.2 3.575C16.4 3.39167 16.621 3.25 16.863 3.15C17.105 3.05 17.359 3 17.625 3C17.891 3 18.1493 3.05 18.4 3.15C18.6507 3.25 18.8673 3.4 19.05 3.6L20.425 5C20.625 5.18333 20.771 5.4 20.863 5.65C20.955 5.9 21.0007 6.15 21 6.4C21 6.66667 20.9543 6.921 20.863 7.163C20.7717 7.405 20.6257 7.62567 20.425 7.825L7.25 21H3ZM17.6 7.8L19 6.4L17.6 5L16.2 6.4L17.6 7.8Z" fill="currentColor"/></svg>',
		delete: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 4H15.5L14.5 3H9.5L8.5 4H5V6H19M6 19C6 19.5304 6.21071 20.0391 6.58579 20.4142C6.96086 20.7893 7.46957 21 8 21H16C16.5304 21 17.0391 20.7893 17.4142 20.4142C17.7893 20.0391 18 19.5304 18 19V7H6V19Z" fill="currentColor"/></svg>',
		send: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.9136 13.0853C10.7224 12.8945 10.4947 12.7444 10.244 12.6441L2.31399 9.46406C2.21931 9.42606 2.13851 9.36002 2.08245 9.27478C2.02638 9.18955 1.99773 9.0892 2.00035 8.98722C2.00296 8.88523 2.03671 8.78648 2.09706 8.70423C2.15741 8.62197 2.24148 8.56015 2.33799 8.52706L21.338 2.02706C21.4266 1.99505 21.5225 1.98894 21.6144 2.00945C21.7064 2.02995 21.7906 2.07622 21.8572 2.14283C21.9238 2.20945 21.9701 2.29366 21.9906 2.38561C22.0111 2.47756 22.005 2.57345 21.973 2.66206L15.473 21.6621C15.4399 21.7586 15.3781 21.8426 15.2958 21.903C15.2136 21.9633 15.1148 21.9971 15.0128 21.9997C14.9108 22.0023 14.8105 21.9737 14.7253 21.9176C14.64 21.8615 14.574 21.7807 14.536 21.6861L11.356 13.7541C11.2552 13.5036 11.1047 13.2761 10.9136 13.0853ZM10.9136 13.0853L21.854 2.14706" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
	};


const DEFAULT_USERNAME = window.USERNAME || 'You';
let CURRENT_USER = null;

function getDisplayName() {
	if (CURRENT_USER) return CURRENT_USER.full_name || CURRENT_USER.username || DEFAULT_USERNAME;
	return DEFAULT_USERNAME;
}


	const $ = (s, root = document) => root.querySelector(s);
	const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
	const escape = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');



	const API = 'https://booky-trans.onrender.com';


const REVIEWS_PAGE_SIZE = 3;

	function apiFetch(path, opts = {}) {

		const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('access_token');

		const headers = Object.assign({}, opts.headers || {});
		if (opts.body && !(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
		if (token) headers['Authorization'] = `Bearer ${token}`;

		console.debug('[apiFetch] ', path, ' auth?', !!headers['Authorization']);
		return fetch(API + path, { ...opts, headers });
	}



	async function loadBookFromQuery() {
		const bookId = getQueryParam('book_id');
		if (!bookId) return;

		await ensureAuth();

		try {
			const res = await apiFetch('/books/');
			if (!res.ok) return;
			const books = await res.json();
			const book = books.find(b => String(b.id) === String(bookId));
			if (!book) return;

			const bc = $('.book-card');
			if (bc) {


				const h3El = bc.querySelector('h3');
				if (h3El) {

					let node = h3El.previousSibling;
					while (node) {
						const prevNode = node.previousSibling;
						if (node.nodeType === 1 && node.tagName === 'IMG') {
							node.remove();
						}
						node = prevNode;
					}
				}
				
				$('h3', bc).textContent = book.name || '';
				$('.by', bc).textContent = `By ${book.author || ''}`;

				const descEl = $('.desc', bc) || document.querySelector('.desc');
				if (descEl) descEl.textContent = book.description || '';
				const meta = $$('.meta li', bc);
				if (meta && meta.length >= 3) {
					meta[0].querySelector('.meta-value').textContent = book.category || '';
					meta[1].querySelector('.meta-value').textContent = book.language || '';
					meta[2].querySelector('.meta-value').textContent = book.target_language || '';
				}

				if (book.img_path && book.img_path.trim() !== '' && !book.img_path.includes('placeholder')) {
					const imgEl = document.createElement('img');
					// Construct full URL for image path, matching BookListing.js behavior
					imgEl.src = book.img_path.startsWith('http') ? book.img_path : `${API}${book.img_path}`;
					imgEl.alt = 'cover';
					imgEl.className = 'book-cover';
					imgEl.style.maxWidth = '120px';
					imgEl.style.display = 'block';
					imgEl.style.marginBottom = '12px';

					imgEl.onerror = function() {
						this.remove();
					};
					bc.insertBefore(imgEl, bc.querySelector('h3'));
				}

				const dl = $('.download-btn', bc) || document.querySelector('.download-btn');
				if (dl && book.id) {

					dl.addEventListener('click', (e) => {
						e.preventDefault();
						window.location.href = `${API}/books/${bookId}/download`;
					});

					dl.setAttribute('role', 'link');
				}

				const subtitle = document.querySelector('.community .subtitle');
				if (subtitle) subtitle.textContent = `Review and rate translations for "${book.name || ''}" into ${book.target_language || ''}`;

				const heart = $('.heart-icon', bc) || document.querySelector('.heart-icon');
				if (heart) {
					heart.addEventListener('click', async () => {
						const user = await ensureAuth();
						if (!user) {
							if (confirm('You must be logged in to favorite. Go to login?')) window.location.href = '../../Authentication/Login/login.html';
							return;
						}
						try {
							const res = await apiFetch(`/books/${bookId}`, { method: 'POST' });
							if (res.ok) {
								const data = await res.json();
								heart.classList.toggle('favorited', data.favorited === true);
							} else {
								alert('Could not toggle favorite');
							}
						} catch (e) { console.error(e); alert('Error toggling favorite'); }
					});


					if (CURRENT_USER) {
						// Check if book is in user's favorites list
						try {
							const favRes = await apiFetch('/profile/favorites');
							if (favRes.ok) {
								const favorites = await favRes.json();
								const isFavorited = favorites.some(fav => String(fav.id) === String(bookId));
								heart.classList.toggle('favorited', isFavorited);
								heart.setAttribute('aria-pressed', isFavorited ? 'true' : 'false');
							}
						} catch (err) { console.error('Could not fetch favorite state', err); }
					}
				}
			}

			loadTranslationsForBook(bookId);
		} catch (e) { console.error(e); }
	}

	async function loadTranslationsForBook(bookId) {

		await ensureAuth();
		try {
			const res = await apiFetch(`/Books/${bookId}/Translations/`);
			if (!res.ok) return;
			const translations = await res.json();

			const community = document.querySelector('.community');

			const existing = Array.from(community.querySelectorAll('.translation-card'));
			existing.forEach(el => el.remove());

			for (const tr of translations) {
				const card = document.createElement('div');
				card.className = 'translation-card';
				card.dataset.translationId = tr.id;

				const authorName = tr.author_display || ((CURRENT_USER && CURRENT_USER.id && Number(CURRENT_USER.id) === Number(tr.user_id)) ? getDisplayName() : ('User ' + tr.user_id));
				card.innerHTML = `
					<div class="avatar"></div>
					<div class="card-body">
						<div class="card-header">
							<div>
								<strong>${escape(authorName)}</strong>
								<div class="date">${tr.upload_date || ''}</div>
							</div>
						</div>
						<div class="file-row">
							<div class="file-name">
								<img src="../../assets/icons/file-icon.svg" alt="file" class="file-icon" style="vertical-align:middle;width:22px;margin-right:10px;">
								<span>${escape(tr.file_path ? tr.file_path.split('/').pop() : 'translation')}</span>
							</div>
							<a class="download small" href="${API}/Books/${bookId}/Translations/${tr.id}/download"> 
								<img src="../../assets/icons/download-icon.svg" alt="download" class="icon" style="vertical-align:middle;width:18px;margin-right:6px;">download
							</a>
						</div>
						<div class="rating-row">
							<div class="avg-stars">☆☆☆☆☆</div>
							<div class="avg">Avg Rating: 0</div>
							<div class="actions">
								<button class="rate-btn"> <img src="../../assets/icons/rate-icon.svg" alt="rate" class="icon" style="vertical-align:middle;width:18px;margin-right:4px;">rate</button>
								<button class="comment-btn"> <img src="../../assets/icons/commet-icon.svg" alt="comment" class="icon" style="vertical-align:middle;width:18px;margin-right:4px;">comment</button>
							</div>
						</div>
						<div class="review-form hidden">
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
						<div class="comments-section hidden" aria-live="polite">
							<div class="comment-composer">
								<textarea placeholder="Write your comment" rows="3"></textarea>
								<button class="submit-comment" aria-label="Send comment">Send</button>
							</div>
							<div class="ratings-list comments-list hidden"></div>
							<div class="comments-list hidden"></div>
						</div>
					</div>
				`;

				const community = document.querySelector('.community');
				if (community) community.insertBefore(card, community.querySelector('.subtitle').nextSibling);

				loadReviewsForTranslation(bookId, tr.id, card);
				attachHandlersToCard(card);
			}
		} catch (e) { console.error(e); }
	}

	async function loadReviewsForTranslation(bookId, translationId, card) {

		await ensureAuth();
		try {
			const res = await apiFetch(`/Books/${bookId}/Translations/${translationId}/reviews`);
			if (!res.ok) return;
			const reviews = await res.json();


			card._allReviews = reviews || [];
			card._commentsOffset = 0;
			card._ratingsOffset = 0;
			card._pageSize = REVIEWS_PAGE_SIZE;


			const ratingsList = $('.ratings-list', card) || $('.ratings-list', $('.comments-section', card));
			const commentsList = $('.comments-list', card) || $('.comments-list', $('.comments-section', card));
			if (ratingsList) { ratingsList.innerHTML = ''; ratingsList.classList.add('hidden'); }
			if (commentsList) { commentsList.innerHTML = ''; commentsList.classList.add('hidden'); }

			const cs = $('.comments-section', card);
			if (cs) {
				const existingContainer = cs.querySelector('.load-more-container');
				if (existingContainer) existingContainer.remove();
			}


			renderReviewsChunk(card, 'ratings');
			renderReviewsChunk(card, 'comments');

			updateAvgForCard(card);
		} catch (e) { console.error(e); }
	}


	function renderReviewsChunk(card, type) {
		if (!card || !card._allReviews) return;
		const page = card._pageSize || REVIEWS_PAGE_SIZE;
		const isRatings = type === 'ratings';
		const list = isRatings ? ($('.ratings-list', card) || $('.ratings-list', $('.comments-section', card))) : ($('.comments-list', card) || $('.comments-list', $('.comments-section', card)));
		if (!list) return;


		const source = card._allReviews.filter(r => isRatings ? (r.rating) : (r.comment));
		const offsetKey = isRatings ? '_ratingsOffset' : '_commentsOffset';
		card[offsetKey] = card[offsetKey] || 0;


		const chunk = source.slice(card[offsetKey], card[offsetKey] + page);

		chunk.forEach(r => {
			const authorName = r.author_display || ((CURRENT_USER && CURRENT_USER.id && Number(CURRENT_USER.id) === Number(r.user_id)) ? getDisplayName() : ('User ' + r.user_id));
			if (isRatings) {
				const node = makeRating(authorName, r.rating, r.user_id, r.date_issued, r.id);
				list.appendChild(node);
			} else {
				const cnode = makeComment(authorName, r.comment, r.user_id, r.date_issued, r.id);
				list.appendChild(cnode);
			}
		});

		card[offsetKey] += chunk.length;

		if (chunk.length > 0) list.classList.remove('hidden');


		const cs = $('.comments-section', card);
		if (!cs) return;
		
		let container = cs.querySelector('.load-more-container');
		if (!container) {
			container = document.createElement('div');
			container.className = 'load-more-container';
			cs.appendChild(container);
		}
		

		const old = container.querySelector(isRatings ? '.load-more-ratings' : '.load-more-comments');
		if (old) old.remove();


		if (card[offsetKey] < source.length) {
			const more = createLoadMoreButton(isRatings ? 'ratings' : 'comments');
			more.addEventListener('click', () => renderReviewsChunk(card, type));
			container.appendChild(more);
		}
	}

	function createLoadMoreButton(kind) {

		const btn = document.createElement('button');
		btn.type = 'button';

		btn.className = `submit-rating load-more-${kind}`;
		btn.textContent = 'Load more ' + (kind === 'ratings' ? 'ratings' : 'comments');

		btn.style.display = 'block';
		btn.style.margin = '10px auto';
		btn.style.width = 'auto';
		btn.style.padding = '8px 12px';
		return btn;
	}


function updateAvgForCard(card) {
	if (!card) return;
	const reviews = card._allReviews || [];
	const ratingReviews = reviews.filter(r => r && r.rating != null && r.rating !== '');
	const avgEl = $('.avg', card) || $('.avg');
	const starsEl = $('.avg-stars', card) || $('.avg-stars');
	if (!ratingReviews.length) {
		if (starsEl) starsEl.textContent = '☆☆☆☆☆';
		if (avgEl) avgEl.textContent = 'Avg Rating: 0';
		return;
	}
	const sum = ratingReviews.reduce((s, r) => s + Number(r.rating || 0), 0);
	const avg = sum / ratingReviews.length;
	const rounded = Math.round(avg);
	const stars = Array.from({length:5}, (_,i) => i < rounded ? '★' : '☆').join('');
	if (starsEl) starsEl.textContent = stars;
	if (avgEl) avgEl.textContent = `Avg Rating: ${avg.toFixed(1)}`;
}

	async function ensureAuth() {

		if (CURRENT_USER) {
			return CURRENT_USER;
		}
		
		try {

			const tokenFound = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('access_token');
			if (!tokenFound) {
				console.debug('[ensureAuth] No token found');
				CURRENT_USER = null;
				return null;
			}
			
			console.debug('[ensureAuth] token present:', !!tokenFound);
			const res = await apiFetch('/profile/me');
			if (!res.ok) {

				if (res.status === 401) {
					console.warn('[ensureAuth] Token invalid or expired');
					localStorage.removeItem('token');
					localStorage.removeItem('accessToken');
					localStorage.removeItem('access_token');
				}
				try { const txt = await res.text(); console.warn('[ensureAuth] /profile/me failed', res.status, txt); } catch(e){}
				CURRENT_USER = null; 
				return null;
			}
			const user = await res.json();
			CURRENT_USER = user;
			console.debug('[ensureAuth] user:', user && user.username ? user.username : user);
			return user;
		} catch (e) { 
			console.error('[ensureAuth] error', e); 
			CURRENT_USER = null;
			return null; 
		}
	}

	function getQueryParam(name) {
		return new URLSearchParams(window.location.search).get(name);
	}

	





	function makeComment(author, text, authorId, dateIssued, reviewId) {
		const item = document.createElement('div');
		item.className = 'comment-item';
		if (reviewId) item.dataset.reviewId = String(reviewId);
		item.innerHTML = `
			<div class="comment-top">
				<div class="comment-author-info">
					<strong class="comment-author">${escape(author)}</strong>
					<div class="comment-date">${escape(formatDate(dateIssued))}</div>
				</div>
				<div class="comment-actions"></div>
			</div>
			<div class="comment-text">${escape(text)}</div>
		`;
			const actions = $('.comment-actions', item);

			if (CURRENT_USER && authorId && Number(CURRENT_USER.id) === Number(authorId)) {
				actions.appendChild(makeIconButton('comment-edit', icons.edit, 'Edit comment'));
				actions.appendChild(makeIconButton('comment-delete', icons.delete, 'Delete comment'));
			}
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





	function makeRating(author, value, authorId, dateIssued, reviewId) {
		const item = document.createElement('div');
		item.className = 'comment-item rating-item';
		item.dataset.value = String(value);
		if (reviewId) item.dataset.reviewId = String(reviewId);
		const stars = Array.from({length: 5}, (_, i) => i < value ? '★' : '☆').join('');
		item.innerHTML = `
			<div class="comment-top">
				<div class="comment-author-info">
					<strong class="comment-author">${escape(author)}</strong>
					<div class="comment-date">${escape(formatDate(dateIssued))}</div>
				</div>
				<div class="comment-actions"></div>
			</div>
			<div class="comment-text rating-stars" data-value="${value}">${stars}</div>
		`;
			const actions = $('.comment-actions', item);

			if (CURRENT_USER && authorId && Number(CURRENT_USER.id) === Number(authorId)) {
				actions.appendChild(makeIconButton('rating-edit', icons.edit, 'Edit rating'));
				actions.appendChild(makeIconButton('rating-delete', icons.delete, 'Delete rating'));
			}
		return item;
	}


	$$('.heart-icon').forEach(h => {
		h.setAttribute('role', 'button');
		h.setAttribute('tabindex', '0');
		h.setAttribute('aria-pressed', 'false');
		h.addEventListener('click', async (ev) => {
			ev.preventDefault();
			const user = await ensureAuth();
			if (!user) {
				if (confirm('You must be logged in to favorite. Go to login?')) window.location.href = '../../Authentication/Login/login.html';
				return;
			}

			const bookId = getQueryParam('book_id');
			if (!bookId) {

				h.classList.toggle('favorited');
				h.setAttribute('aria-pressed', h.classList.contains('favorited') ? 'true' : 'false');
				return;
			}
			try {
				const res = await apiFetch(`/books/${bookId}`, { method: 'POST' });
				if (!res.ok) {
					alert('Could not toggle favorite');
					return;
				}
				const data = await res.json();
				h.classList.toggle('favorited', data.favorited === true);
				h.setAttribute('aria-pressed', h.classList.contains('favorited') ? 'true' : 'false');
			} catch (err) { console.error(err); alert('Error toggling favorite'); }
		});
		h.addEventListener('keydown', (ev) => {
			if (ev.key === 'Enter' || ev.key === ' ') {
				ev.preventDefault();
				h.click();
			}
		});
	});


	$$('.rate-btn').forEach(btn => btn.addEventListener('click', e => {
		const card = e.target.closest('.translation-card');
		if (!card) return;
		$('.review-form', card)?.classList.toggle('hidden');

		const cs = $('.comments-section', card);
		cs?.classList.add('hidden');
	}));

	$$('.comment-btn').forEach(btn => btn.addEventListener('click', e => {
		const card = e.target.closest('.translation-card');
		if (!card) return;

		$('.review-form', card)?.classList.add('hidden');
		const cs = $('.comments-section', card);
		if (!cs) return;
		cs.classList.toggle('hidden');
		if (!cs.classList.contains('hidden')) {

			$('.ratings-list', cs)?.classList.remove('hidden');
			$('.comments-list', cs)?.classList.remove('hidden');
			const ta = $('.comment-composer textarea', cs) || $('textarea', cs);
			if (ta) ta.focus();
		}
	}));


	$$('.translation-card').forEach(card => {
		const stars = $$('.star', card);
		stars.forEach(s => s.addEventListener('click', () => {
			const v = Number(s.dataset.value || 0);
			stars.forEach(x => x.textContent = Number(x.dataset.value) <= v ? '★' : '☆');
			$('.review-form', card).dataset.value = v;
		}));

		$('.submit-rating', card)?.addEventListener('click', async () => {
			const rf = $('.review-form', card);
			const v = rf?.dataset.value;
			if (!v) return alert('Please select a rating');
			const num = Number(v);
			const ratingsList = $('.ratings-list', card) || $('.ratings-list', $('.comments-section', card));

			const bookId = getQueryParam('book_id');
			const translationId = card.dataset.translationId;
			if (bookId && translationId) {
				const user = await ensureAuth();
				if (!user) {
					if (confirm('You must be logged in to submit a review. Go to login?')) window.location.href = '../../Authentication/Login/login.html';
					return;
				}
				try {
					const reviewId = rf?._editingReviewId;
					const body = { rating: num };
					

					if (reviewId) {
						const res = await apiFetch(`/Books/${bookId}/Translations/${translationId}/reviews/${reviewId}`, { 
							method: 'PATCH', 
							body: JSON.stringify(body) 
						});
						if (!res.ok) {
							const txt = await res.text().catch(() => '');
							alert('Failed to update rating: ' + txt);
							return;
						}
						const data = await res.json();
						const rev = data.review;

						if (card._allReviews) {
							const reviewIndex = card._allReviews.findIndex(r => r.id == reviewId);
							if (reviewIndex !== -1) {
								card._allReviews[reviewIndex] = rev;
							}
						}
						updateAvgForCard(card);

						if (rf._editingEl) {
							const el = rf._editingEl;
							el.dataset.value = String(num);
							const stars = Array.from({length:5}, (_,i) => i < num ? '★' : '☆').join('');
							$('.rating-stars', el).textContent = stars;
							rf._editingEl = null;
							rf._editingReviewId = null;
						}
					} else {

						body.comment = '';
						const res = await apiFetch(`/Books/${bookId}/Translations/${translationId}/review`, { method: 'POST', body: JSON.stringify(body) });
						if (!res.ok) {
							const txt = await res.text().catch(() => '');
							alert('Failed to submit review: ' + txt);
							return;
						}
						const data = await res.json();
						const rev = data.review;

						card._allReviews = card._allReviews || [];
						card._allReviews.unshift(rev);
						updateAvgForCard(card);
						const authorName = rev?.author_display || user.full_name || user.username || getDisplayName();
						const node = makeRating(authorName, rev.rating, user.id, rev.date_issued, rev.id);
						if (ratingsList) { ratingsList.insertBefore(node, ratingsList.firstChild); ratingsList.classList.remove('hidden'); }
					}
				} catch (err) {
					console.error(err);
					alert('Error submitting review');
					return;
				}
			} else {

				if (rf && rf._editingEl) {
					const el = rf._editingEl;
					el.dataset.value = String(num);
					const stars = Array.from({length:5}, (_,i) => i < num ? '★' : '☆').join('');
					$('.rating-stars', el).textContent = stars;
					rf._editingEl = null;
					rf._editingReviewId = null;
				} else {
					const user = await ensureAuth();
					if (!user) {
						if (confirm('You must be logged in to submit a rating. Go to login?')) window.location.href = '../../Authentication/Login/login.html';
						return;
					}
					const node = makeRating(user.full_name || user.username || getDisplayName(), num, user.id, new Date().toISOString(), null);
					if (ratingsList) { ratingsList.insertBefore(node, ratingsList.firstChild); ratingsList.classList.remove('hidden'); }
				}
			}

			rf?.classList.add('hidden');
		});

		const sendBtn = $('.submit-comment', card);
		if (sendBtn) sendBtn.innerHTML = icons.send;

		sendBtn?.addEventListener('click', async () => {
			const cs = $('.comments-section', card);
			const ta = cs ? $('.comment-composer textarea', cs) : $('.comment-composer textarea', card);
			if (!ta) return;
			const text = ta.value.trim();
			if (!text) return alert('Please enter a comment');

			const user = await ensureAuth();
			if (!user) {
				if (confirm('You must be logged in to post a comment. Go to login?')) window.location.href = '../../Authentication/Login/login.html';
				return;
			}

			const bookId = getQueryParam('book_id');
			const translationId = card.dataset.translationId;
			if (bookId && translationId) {

					try {
						const rf = $('.review-form', card);
						const ratingVal = rf?.dataset.value;
						const body = {};
						if (ratingVal) body.rating = Number(ratingVal);
						body.comment = text;
						const res = await apiFetch(`/Books/${bookId}/Translations/${translationId}/review`, { method: 'POST', body: JSON.stringify(body) });
						if (!res.ok) {
							const txt = await res.text().catch(() => '');
							alert('Failed to save comment/review: ' + txt);
						} else {
							const data = await res.json();
							const rev = data.review;

							card._allReviews = card._allReviews || [];
							card._allReviews.unshift(rev);
							updateAvgForCard(card);
							const list = cs ? $('.comments-list', cs) : $('.comments-list', card);
							const authorName = rev?.author_display || user.full_name || user.username || getDisplayName();
							const node = makeComment(authorName, rev.comment || text, user.id, rev.date_issued, rev.id);
							if (list) { list.insertBefore(node, list.firstChild); list.classList.remove('hidden'); }

							if (rev.rating) {
								const ratingsList = $('.ratings-list', cs) || $('.ratings-list', card);
								const rnode = makeRating(authorName, rev.rating, user.id, rev.date_issued, rev.id);
								if (ratingsList) { ratingsList.insertBefore(rnode, ratingsList.firstChild); ratingsList.classList.remove('hidden'); }
							}
						}
					} catch (err) { console.error(err); alert('Error saving comment'); }

					ta.value = '';
					return;
			}

			const list = cs ? $('.comments-list', cs) : $('.comments-list', card);
					const node = makeComment(user.full_name || user.username || getDisplayName(), text, user.id, new Date().toISOString(), null);
			if (list) { list.insertBefore(node, list.firstChild); list.classList.remove('hidden'); }
			ta.value = '';
			if (cs) cs.classList.remove('hidden');
		});
	});


	const uploadDrop = $('.upload-drop');

	const uploadInput = document.createElement('input');
	uploadInput.type = 'file';
	uploadInput.accept = '.pdf,.txt';
	uploadInput.style.display = 'none';
	document.body.appendChild(uploadInput);
	let selectedFile = null;

	function setUploadFilename(name) {
		let el = $('.upload-filename', uploadDrop);
		if (!el) {
			el = document.createElement('div');
			el.className = 'upload-filename';
			el.style.marginTop = '8px';
			el.style.fontSize = '13px';
			uploadDrop.appendChild(el);
		}
		el.textContent = name || '';
	}

	uploadDrop?.addEventListener('click', () => {
		uploadInput.click();
	});

	uploadInput.addEventListener('change', () => {
		if (!uploadInput.files || !uploadInput.files[0]) { selectedFile = null; setUploadFilename(''); return; }
		selectedFile = uploadInput.files[0];
		setUploadFilename(selectedFile.name);
	});


	function attachHandlersToCard(card) {
		if (!card || card.dataset.initialized === '1') return;
		card.dataset.initialized = '1';


		const rbtn = $('.rate-btn', card);
		if (rbtn) rbtn.addEventListener('click', () => {
			$('.review-form', card)?.classList.toggle('hidden');
			$('.comments-section', card)?.classList.add('hidden');
		});


		const cbtn = $('.comment-btn', card);
		if (cbtn) cbtn.addEventListener('click', () => {
			$('.review-form', card)?.classList.add('hidden');
			const cs = $('.comments-section', card);
			if (!cs) return;
			cs.classList.toggle('hidden');
			if (!cs.classList.contains('hidden')) {
				$('.ratings-list', cs)?.classList.remove('hidden');
				$('.comments-list', cs)?.classList.remove('hidden');
				const ta = $('.comment-composer textarea', cs) || $('textarea', cs);
				if (ta) ta.focus();
			}
		});


		const stars = $$('.star', card);
		stars.forEach(s => s.addEventListener('click', () => {
			const v = Number(s.dataset.value || 0);
			stars.forEach(x => x.textContent = Number(x.dataset.value) <= v ? '★' : '☆');
			$('.review-form', card).dataset.value = v;
		}));


		$('.submit-rating', card)?.addEventListener('click', async () => {
			const rf = $('.review-form', card);
			const v = rf?.dataset.value;
			if (!v) return alert('Please select a rating');
			const num = Number(v);
			const ratingsList = $('.ratings-list', card) || $('.ratings-list', $('.comments-section', card));
			const bookId = getQueryParam('book_id');
			const translationId = card.dataset.translationId;
			if (bookId && translationId) {
				const user = await ensureAuth();
				if (!user) {
					if (confirm('You must be logged in to submit a review. Go to login?')) window.location.href = '../../Authentication/Login/login.html';
					return;
				}
				try {
					const reviewId = rf?._editingReviewId;
					const body = { rating: num };
					

					if (reviewId) {
						const res = await apiFetch(`/Books/${bookId}/Translations/${translationId}/reviews/${reviewId}`, { 
							method: 'PATCH', 
							body: JSON.stringify(body) 
						});
						if (!res.ok) {
							const txt = await res.text().catch(() => '');
							alert('Failed to update rating: ' + txt);
							return;
						}
						const data = await res.json();
						const rev = data.review;

						if (card._allReviews) {
							const reviewIndex = card._allReviews.findIndex(r => r.id == reviewId);
							if (reviewIndex !== -1) {
								card._allReviews[reviewIndex] = rev;
							}
						}
						updateAvgForCard(card);

						if (rf._editingEl) {
							const el = rf._editingEl;
							el.dataset.value = String(num);
							const stars = Array.from({length:5}, (_,i) => i < num ? '★' : '☆').join('');
							$('.rating-stars', el).textContent = stars;
							rf._editingEl = null;
							rf._editingReviewId = null;
						}
					} else {

						body.comment = '';
						const res = await apiFetch(`/Books/${bookId}/Translations/${translationId}/review`, { method: 'POST', body: JSON.stringify(body) });
						if (!res.ok) {
							const txt = await res.text().catch(() => '');
							alert('Failed to submit review: ' + txt);
							return;
						}
						const data = await res.json();
						const rev = data.review;
						card._allReviews = card._allReviews || [];
						card._allReviews.unshift(rev);
						updateAvgForCard(card);
						const authorName = rev?.author_display || user.full_name || user.username || getDisplayName();
						const node = makeRating(authorName, rev.rating, user.id, rev.date_issued, rev.id);
						if (ratingsList) { ratingsList.insertBefore(node, ratingsList.firstChild); ratingsList.classList.remove('hidden'); }
					}
				} catch (err) {
					console.error(err);
					alert('Error submitting review');
					return;
				}
			} else {
				if (rf && rf._editingEl) {
					const el = rf._editingEl;
					el.dataset.value = String(num);
					const stars = Array.from({length:5}, (_,i) => i < num ? '★' : '☆').join('');
					$('.rating-stars', el).textContent = stars;
					rf._editingEl = null;
					rf._editingReviewId = null;
				} else {
					const user = await ensureAuth();
					if (!user) {
						if (confirm('You must be logged in to submit a rating. Go to login?')) window.location.href = '../../Authentication/Login/login.html';
						return;
					}
					const node = makeRating(user.full_name || user.username || getDisplayName(), num, user.id, new Date().toISOString(), null);
					if (ratingsList) { ratingsList.insertBefore(node, ratingsList.firstChild); ratingsList.classList.remove('hidden'); }
				}
			}
			rf?.classList.add('hidden');
		});


		const sendBtn = $('.submit-comment', card) || $('.submit-comment', $('.comments-section', card));
		if (sendBtn) sendBtn.innerHTML = icons.send;
		sendBtn?.addEventListener('click', async () => {
			const cs = $('.comments-section', card);
			const ta = cs ? $('.comment-composer textarea', cs) : $('.comment-composer textarea', card);
			if (!ta) return;
			const text = ta.value.trim();
			if (!text) return alert('Please enter a comment');

			const user = await ensureAuth();
			if (!user) {
				if (confirm('You must be logged in to post a comment. Go to login?')) window.location.href = '../../Authentication/Login/login.html';
				return;
			}

			const bookId = getQueryParam('book_id');
			const translationId = card.dataset.translationId;
			if (bookId && translationId) {
				try {
					const rf = $('.review-form', card);
					const ratingVal = rf?.dataset.value;
					const body = {};
					if (ratingVal) body.rating = Number(ratingVal);
					body.comment = text;
					const res = await apiFetch(`/Books/${bookId}/Translations/${translationId}/review`, { method: 'POST', body: JSON.stringify(body) });
					if (!res.ok) {
						const txt = await res.text().catch(() => '');
						alert('Failed to save comment/review: ' + txt);
					} else {
						const data = await res.json();
						const rev = data.review;
						card._allReviews = card._allReviews || [];
						card._allReviews.unshift(rev);
						updateAvgForCard(card);
						const list = cs ? $('.comments-list', cs) : $('.comments-list', card);
						const authorName = rev?.author_display || user.full_name || user.username || getDisplayName();
						const node = makeComment(authorName, rev.comment || text, user.id, rev.date_issued, rev.id);
						if (list) { list.insertBefore(node, list.firstChild); list.classList.remove('hidden'); }

						if (rev.rating) {
							const ratingsList = $('.ratings-list', cs) || $('.ratings-list', card);
							const rnode = makeRating(authorName, rev.rating, user.id, rev.date_issued, rev.id);
							if (ratingsList) { ratingsList.insertBefore(rnode, ratingsList.firstChild); ratingsList.classList.remove('hidden'); }
						}
					}
				} catch (err) { console.error(err); alert('Error saving comment'); }

				ta.value = '';
				return;
			}

			const list = cs ? $('.comments-list', cs) : $('.comments-list', card);
			const node = makeComment(user.full_name || user.username || getDisplayName(), text, user.id, new Date().toISOString(), null);
			if (list) { list.insertBefore(node, list.firstChild); list.classList.remove('hidden'); }
			ta.value = '';
			if (cs) cs.classList.remove('hidden');
		});
	}


	const submitTranslation = $('.submit-translation');
	submitTranslation?.addEventListener('click', async () => {
		if (!selectedFile) return alert('Please choose a file to upload first');
		const bookId = getQueryParam('book_id');
		if (!bookId) {
			alert('No book selected - cannot upload translation outside of a book context');
			return;
		}


		const user = await ensureAuth();
		if (!user) {
			if (confirm('You must be logged in to upload a translation. Go to login?')) window.location.href = '../../Authentication/Login/login.html';
			return;
		}

		const form = new FormData();
		form.append('file', selectedFile);
		try {
			const res = await apiFetch(`/Books/${bookId}/Translations/upload`, { method: 'POST', body: form });
			if (!res.ok) {
				const text = await res.text();
				alert('Upload failed: ' + text);
				return;
			}
			const data = await res.json();
			alert('Upload successful');

			loadTranslationsForBook(bookId);
			selectedFile = null; setUploadFilename(''); uploadInput.value = '';
		} catch (err) {
			console.error(err);
			alert('Upload error');
		}
	});



	ensureAuth().catch(err => {
		console.debug('[init] Auth check on load failed (user may not be logged in):', err);
	});


	loadBookFromQuery();


	document.addEventListener('click', (e) => {
		const edit = e.target.closest('.comment-edit');
		const del = e.target.closest('.comment-delete');
		const rEdit = e.target.closest('.rating-edit');
		const rDel = e.target.closest('.rating-delete');
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
			(async () => {
				const item = save.closest('.comment-item');
				const card = save.closest('.translation-card');
				const ta = $('.comment-edit-area', item);
				const newText = ta.value.trim();
				
				if (!newText) {
					alert('Comment cannot be empty');
					return;
				}
				
				const reviewId = item.dataset.reviewId;
				const bookId = getQueryParam('book_id');
				const translationId = card?.dataset.translationId;
				

				if (reviewId && bookId && translationId) {
					try {
						const body = { comment: newText };
						const res = await apiFetch(`/Books/${bookId}/Translations/${translationId}/reviews/${reviewId}`, { 
							method: 'PATCH', 
							body: JSON.stringify(body) 
						});
						if (!res.ok) {
							const txt = await res.text().catch(() => '');
							alert('Failed to update comment: ' + txt);
							return;
						}
						const data = await res.json();

						if (card && card._allReviews) {
							const reviewIndex = card._allReviews.findIndex(r => r.id == reviewId);
							if (reviewIndex !== -1 && data.review) {
								card._allReviews[reviewIndex] = data.review;
							}
						}
					} catch (err) {
						console.error(err);
						alert('Error updating comment');
						return;
					}
				}
				
				const div = document.createElement('div');
				div.className = 'comment-text';
				div.textContent = newText;
				ta.replaceWith(div);
				$('.comment-actions', item).innerHTML = '';
				$('.comment-actions', item).appendChild(makeIconButton('comment-edit', icons.edit, 'Edit comment'));
				$('.comment-actions', item).appendChild(makeIconButton('comment-delete', icons.delete, 'Delete comment'));
			})();
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


		if (rEdit) {
			const item = rEdit.closest('.rating-item');
			const card = rEdit.closest('.translation-card');
			if (!item || !card) return;
			const rf = $('.review-form', card);
			const cs = $('.comments-section', card);
			const value = Number(item.dataset.value || $('.rating-stars', item)?.dataset.value || 0);

			rf?.classList.remove('hidden');

			cs?.classList.add('hidden');
			if (rf) {
				rf.dataset.value = String(value);

				$$('.star', rf).forEach(s => s.textContent = Number(s.dataset.value) <= value ? '★' : '☆');

				rf._editingEl = item;
				rf._editingReviewId = item.dataset.reviewId;
			}
			return;
		}


		if (rDel) {
			(async () => {
				const item = rDel.closest('.rating-item');
				const card = rDel.closest('.translation-card');
				if (!item) return;
				if (!confirm('Delete this rating?')) return;
				
				const reviewId = item.dataset.reviewId;
				const bookId = getQueryParam('book_id');
				const translationId = card?.dataset.translationId;
				

				if (reviewId && bookId && translationId) {
					try {
						const res = await apiFetch(`/Books/${bookId}/Translations/${translationId}/reviews/${reviewId}`, { method: 'DELETE' });
						if (!res.ok) {
							const txt = await res.text().catch(() => '');
							alert('Failed to delete rating: ' + txt);
							return;
						}

						if (card && card._allReviews) {
							card._allReviews = card._allReviews.filter(r => r.id != reviewId);
							updateAvgForCard(card);
						}
					} catch (err) {
						console.error(err);
						alert('Error deleting rating');
						return;
					}
				}
				
				item.remove();
			})();
			return;
		}

		if (del) {
			(async () => {
				const item = del.closest('.comment-item');
				const card = del.closest('.translation-card');
				if (!item) return;
				if (!confirm('Delete this comment?')) return;
				
				const reviewId = item.dataset.reviewId;
				const bookId = getQueryParam('book_id');
				const translationId = card?.dataset.translationId;
				

				if (reviewId && bookId && translationId) {
					try {
						const res = await apiFetch(`/Books/${bookId}/Translations/${translationId}/reviews/${reviewId}`, { method: 'DELETE' });
						if (!res.ok) {
							const txt = await res.text().catch(() => '');
							alert('Failed to delete comment: ' + txt);
							return;
						}

						if (card && card._allReviews) {
							card._allReviews = card._allReviews.filter(r => r.id != reviewId);
						}
					} catch (err) {
						console.error(err);
						alert('Error deleting comment');
						return;
					}
				}
				
				item.remove();
			})();
			return;
		}
	});

});

function toggleMenu(){
	const el = document.getElementById('mobileMenu');
	if (!el) return;
	el.classList.toggle('show');
}


function formatDate(iso) {
	if (!iso) return 'Just now';
	try {

		const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
		if (dateOnly) {
			const parts = iso.split('-').map(x => Number(x));

			const dLocal = new Date(parts[0], parts[1]-1, parts[2]);
			const today = new Date();
			const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
			const msPerDay = 24 * 60 * 60 * 1000;
			const daysDiff = Math.floor((startToday - dLocal) / msPerDay);
			if (daysDiff === 0) return 'Today';
			if (daysDiff === 1) return '1 day ago';
			return `${daysDiff} days ago`;
		}

		const d = new Date(iso);
		if (isNaN(d.getTime())) return 'Just now';
		const diff = (Date.now() - d.getTime()) / 1000;
		if (diff < 60) return 'Just now';
		if (diff < 3600) return Math.floor(diff/60) + 'm ago';
		if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
		return d.toLocaleDateString();
	} catch (e) { return 'Just now'; }
}

