// Agendatepy Design Catalog — Interactive Client Logic
document.addEventListener('DOMContentLoaded', () => {
  // 1. Selector de Tema (Modo Oscuro / Modo Claro)
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('agendate-theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('agendate-theme', next);
      updateThemeIcon(next);
      showToast(`Modo cambiado a ${next === 'dark' ? 'Obsidian Glass' : 'Frosty Glass'}`);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    themeToggle.innerHTML = theme === 'dark' ? '☼ Claro' : '☽ Oscuro';
  }

  // 2. Selector de Color Primario de Marca
  const swatches = document.querySelectorAll('.swatch-btn');
  swatches.forEach(btn => {
    btn.addEventListener('click', () => {
      swatches.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const color = btn.dataset.color;
      const rgb = btn.dataset.rgb;

      document.documentElement.style.setProperty('--primary', color);
      document.documentElement.style.setProperty('--primary-rgb', rgb);

      showToast(`Color primario actualizado a ${btn.dataset.name}`);
    });
  });

  // 3. Perspectiva 3D Tilt Card interactiva al mover el cursor
  const tiltCards = document.querySelectorAll('.glass-tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = -(y / rect.height) * 14;
      const rotateY = (x / rect.width) * 14;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  // 4. Copiar Token o Código al Portapapeles
  const copyElements = document.querySelectorAll('[data-copy]');
  copyElements.forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const text = el.getAttribute('data-copy');
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Copiado: ${text}`);
      });
    });
  });

  // 5. Segmented Controls interactivos
  const segmentBtns = document.querySelectorAll('.segment-btn');
  segmentBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parent = btn.closest('.segmented-control');
      if (parent) {
        parent.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // 6. Range Sliders con feedback numérico en vivo
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(slider => {
    slider.addEventListener('input', () => {
      const displayId = slider.dataset.display;
      if (displayId) {
        const display = document.getElementById(displayId);
        if (display) display.textContent = slider.value + (slider.dataset.unit || '');
      }
    });
  });

  // 7. Modal Demo Trigger
  const openModalBtn = document.getElementById('open-modal-demo');
  const modal = document.getElementById('demo-modal');
  const closeModalBtns = document.querySelectorAll('.close-modal');

  if (openModalBtn && modal) {
    openModalBtn.addEventListener('click', () => {
      modal.showModal();
    });
  }

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modal) modal.close();
    });
  });

  // 8. Toast Demo Launcher
  const toastBtn = document.getElementById('launch-toast-demo');
  if (toastBtn) {
    toastBtn.addEventListener('click', () => {
      showToast('Cita de Carlos Mendoza confirmada con éxito por WhatsApp IA.');
    });
  }
});

// Función de Toast Global
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span style="color: var(--green); font-size: 16px;">✓</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
