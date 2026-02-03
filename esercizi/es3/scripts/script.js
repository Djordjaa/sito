document.querySelectorAll("div").forEach((e) => {
   let counter = 0;
   const originalText = e.textContent;
   const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
   
   e.style.transition = 'background-color 0.2s, flex-grow 0.2s';
   
   e.addEventListener("mouseover", () => {
      const a = counter;
      const r = (Math.cos(a) * 0.4 + 0.5) * 255;
      const g = (Math.cos(a + 2.1) * 0.4 + 0.5) * 70 + 150;
      const b = (Math.cos(a + 4.2) * 0.4 + 0.5) * 20 + 250;
      
      e.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

      let iterations = 0;
      const interval = setInterval(() => {
         e.textContent = chars[Math.floor(Math.random() * chars.length)];
         iterations++;
         
         if (iterations > 7) {
            clearInterval(interval);
            e.textContent = originalText;
         }
      }, 50);
      
      counter += 2;

      e.style.flexGrow = '2';

      e.addEventListener("mouseout", () => {
         e.style.flexGrow = '1';
      });
   });
});