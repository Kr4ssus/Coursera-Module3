document.addEventListener('DOMContentLoaded', function() {
  // Navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-navigation');
  function toggleMenu(){
    if(!navToggle || !nav) return;
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  }
  if(navToggle) navToggle.addEventListener('click', toggleMenu);

  // Smooth scrolling for same-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor){
    anchor.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href && href.startsWith('#') && href.length > 1){
        const target = document.querySelector(href);
        if(target){
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // close mobile nav if open
          if(nav && nav.classList.contains('open')) toggleMenu();
        }
      }
    });
  });

  // Project filtering
  window.filterProjects = function(category){
    const projects = document.querySelectorAll('.project-card');
    projects.forEach(function(card){
      const cats = (card.dataset.category || '').split(/\s+/);
      if(!category || category === 'all' || cats.includes(category)){
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  };

  // Lightbox/modal for project images
  (function initLightbox(){
    const modal = document.createElement('div');
    modal.className = 'lightbox-modal';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-hidden','true');

    modal.innerHTML = '\n      <div class="lightbox-backdrop" tabindex="-1"></div>\n      <div class="lightbox-content" role="document">\n        <button class="lightbox-close" aria-label="Close">×</button>\n        <img src="" alt="" />\n        <p class="lightbox-caption"></p>\n      </div>';

    document.body.appendChild(modal);

    const imgEl = modal.querySelector('img');
    const captionEl = modal.querySelector('.lightbox-caption');
    const closeBtn = modal.querySelector('.lightbox-close');
    const backdrop = modal.querySelector('.lightbox-backdrop');

    function open(src, alt, caption){
      imgEl.src = src || '';
      imgEl.alt = alt || '';
      captionEl.textContent = caption || '';
      modal.setAttribute('aria-hidden','false');
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close(){
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
      imgEl.src = '';
    }

    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    modal.addEventListener('click', function(e){ if(e.target === modal) close(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && modal.classList.contains('open')) close(); });

    document.querySelectorAll('.project-card img').forEach(function(img){
      img.style.cursor = 'pointer';
      img.addEventListener('click', function(){
        const card = img.closest('.project-card');
        const caption = card ? (card.querySelector('figcaption')?.textContent || '') : '';
        open(img.src || img.getAttribute('data-src') || '', img.alt, caption);
      });
    });
  })();

  // Form validation with real-time feedback
  (function initFormValidation(){
    const form = document.querySelector('form[aria-label="Contact form"]');
    if(!form) return;
    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const message = form.querySelector('#message');

    function showError(el, msg){
      let id = el.id + '-error';
      let existing = form.querySelector('#' + id);
      if(!existing){
        existing = document.createElement('div');
        existing.id = id;
        existing.className = 'field-error';
        existing.setAttribute('aria-live','polite');
        el.insertAdjacentElement('afterend', existing);
      }
      existing.textContent = msg;
      el.setAttribute('aria-invalid','true');
    }
    function clearError(el){
      let id = el.id + '-error';
      let existing = form.querySelector('#' + id);
      if(existing) existing.remove();
      el.removeAttribute('aria-invalid');
    }
    function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

    [name, email, message].forEach(function(el){
      if(!el) return;
      el.addEventListener('input', function(){
        if(!el.value.trim()){
          showError(el, 'This field is required.');
        } else if(el === email && !validEmail(el.value)){
          showError(el, 'Please enter a valid email address.');
        } else {
          clearError(el);
        }
      });
    });

    form.addEventListener('submit', function(e){
      let valid = true;
      [name, email, message].forEach(function(el){
        if(!el) return;
        if(!el.value.trim()){ showError(el, 'This field is required.'); valid = false; }
        else if(el === email && !validEmail(el.value)){ showError(el, 'Please enter a valid email address.'); valid = false; }
      });
      if(!valid){
        e.preventDefault();
        const firstErr = form.querySelector('.field-error');
        if(firstErr){ const related = firstErr.previousElementSibling; if(related && typeof related.focus === 'function') related.focus(); }
      } else {
        // Demo submission: show feedback and reset
        e.preventDefault();
        const msg = document.createElement('div');
        msg.className = 'submit-message';
        msg.setAttribute('role','status');
        msg.textContent = 'Thanks — your message was sent (demo).';
        form.appendChild(msg);
        form.reset();
        setTimeout(function(){ msg.remove(); }, 4000);
      }
    });
  })();

});
