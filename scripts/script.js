 const body = document.body;
      const previewEl = document.getElementById('preview');
      const workItems = document.querySelectorAll('.work-item');

      window.addEventListener('mousemove', (e) => {
        body.style.setProperty('--cursor-x', `${e.clientX}px`);
        body.style.setProperty('--cursor-y', `${e.clientY}px`);
      });

      workItems.forEach((item) => {
        item.addEventListener('mouseenter', () => {
          const imgUrl = item.getAttribute('data-img');
          previewEl.style.backgroundImage = `url(${imgUrl})`;
          previewEl.classList.add('is-visible');
        });

        item.addEventListener('mouseleave', () => {
          previewEl.classList.remove('is-visible');
        });
      });