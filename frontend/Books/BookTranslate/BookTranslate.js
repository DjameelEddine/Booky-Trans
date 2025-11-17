// Simple interaction for rate/comment toggles and star rating
document.addEventListener('DOMContentLoaded', function(){
	// toggle review form
	document.querySelectorAll('.rate-btn').forEach(btn => {
		btn.addEventListener('click', function(e){
			const card = e.target.closest('.translation-card');
			if(!card) return;
			const review = card.querySelector('.review-form');
			const comment = card.querySelector('.comment-form');
			review.classList.toggle('hidden');
			if(comment) comment.classList.add('hidden');
		});
	});

	// toggle comment form
	document.querySelectorAll('.comment-btn').forEach(btn => {
		btn.addEventListener('click', function(e){
			const card = e.target.closest('.translation-card');
			if(!card) return;
			const review = card.querySelector('.review-form');
			const comment = card.querySelector('.comment-form');
			comment.classList.toggle('hidden');
			if(review) review.classList.add('hidden');
		});
	});

	// star click handling (works per card)
	document.querySelectorAll('.translation-card').forEach(card => {
		const stars = card.querySelectorAll('.star');
		stars.forEach(star => {
			star.addEventListener('click', function(){
				const v = Number(this.dataset.value || 0);
				stars.forEach(s => {
					const sv = Number(s.dataset.value || 0);
					if(sv <= v){
						s.classList.add('active');
						s.textContent = '★';
					} else {
						s.classList.remove('active');
						s.textContent = '☆';
					}
				});
				// store value on form element
				const review = card.querySelector('.review-form');
				if(review) review.dataset.value = v;
			});
		});

		// submit rating
		const submitRating = card.querySelector('.submit-rating');
		if(submitRating){
			submitRating.addEventListener('click', function(){
				const review = card.querySelector('.review-form');
				const val = review && review.dataset.value ? review.dataset.value : null;
				if(!val){
					alert('Please select a rating');
					return;
				}
				alert('Rating submitted: ' + val + ' star(s)');
				review.classList.add('hidden');
			});
		}

		// submit comment
		const submitComment = card.querySelector('.submit-comment');
		if(submitComment){
			submitComment.addEventListener('click', function(){
				const textarea = card.querySelector('.comment-form textarea');
				if(!textarea) return;
				const txt = textarea.value.trim();
				if(!txt){
					alert('Please enter a comment');
					return;
				}
				alert('Comment submitted: "' + txt + '"');
				textarea.value = '';
				card.querySelector('.comment-form').classList.add('hidden');
			});
		}
	});
});

// expose toggleMenu for the hamburger in the nav
function toggleMenu(){
	const el = document.getElementById('mobileMenu');
	if(!el) return;
	el.classList.toggle('show');
}
