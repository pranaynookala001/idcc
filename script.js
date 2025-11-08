(function () {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  const cartToggle = document.querySelector('.cart-toggle');
  const cartPanel = document.querySelector('.cart-panel');
  const cartBackdrop = document.querySelector('[data-cart-backdrop]');
  const cartClose = document.querySelector('.cart-close');
  const cartCount = document.querySelector('[data-cart-count]');
  const cartItemsContainer = document.querySelector('[data-cart-items]');
  const cartEmptyMessage = document.querySelector('[data-cart-empty]');
  const cartTotal = document.querySelector('[data-cart-total]');
  const checkoutButton = document.querySelector('[data-cart-checkout]');
  const contactForm = document.querySelector('.contact-form');
  const tryonUpload = document.querySelector('[data-tryon-upload]');
  const tryonPhoto = document.querySelector('[data-tryon-photo]');
  const tryonOverlay = document.querySelector('[data-tryon-overlay]');
  const tryonPlaceholder = document.querySelector('[data-tryon-placeholder]');
  const tryonStyleRadios = document.querySelectorAll('[name="tryon-style"]');
  const tryonScale = document.querySelector('[data-tryon-scale]');
  const tryonOffsetX = document.querySelector('[data-tryon-offset-x]');
  const tryonOffsetY = document.querySelector('[data-tryon-offset-y]');
  const tryonReset = document.querySelector('[data-tryon-reset]');

  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const cart = new Map();
  const hairstyleLibrary = {
    'cindy-long': {
      src: 'CINDYLONG WEAVE.png',
      alt: 'Cindy Long braid overlay',
    },
    'yaki-braid': {
      src: 'YAKI BRAID.png',
      alt: 'Yaki Braid overlay with colored tips',
    },
    'euro-straight': {
      src: 'Photos/Weaves/Screenshot%202025-11-07%20at%208.10.36%E2%80%AFPM.png',
      alt: 'Euro Straight weave overlay',
    },
    'bumper-curl': {
      src: 'BUMPER CURL WEAVE.png',
      alt: 'Bumper Curl weave overlay',
    },
    topiaz: {
      src: 'TOPIAZ WEAVE.png',
      alt: 'Topiaz weave overlay',
    },
  };
  let tryonHasPhoto = false;
  let tryonSelectedStyle = '';

  function formatPrice(amount) {
    return currency.format(amount);
  }

  function openCart() {
    if (!cartPanel) return;
    cartPanel.classList.add('is-open');
    cartPanel.setAttribute('aria-hidden', 'false');
    cartToggle?.setAttribute('aria-expanded', 'true');
    if (cartBackdrop) {
      cartBackdrop.classList.add('is-active');
      cartBackdrop.removeAttribute('hidden');
    }
  }

  function closeCart() {
    if (!cartPanel) return;
    cartPanel.classList.remove('is-open');
    cartPanel.setAttribute('aria-hidden', 'true');
    cartToggle?.setAttribute('aria-expanded', 'false');
    if (cartBackdrop) {
      cartBackdrop.classList.remove('is-active');
      cartBackdrop.setAttribute('hidden', '');
    }
  }

  function createCartItemElement(item) {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.dataset.productId = item.id;
    const categoryMarkup = item.category ? `<div class="cart-item-category">${item.category}</div>` : '';

    li.innerHTML = `
      <div class="cart-item-header">
        <h3>${item.name}</h3>
        <span class="cart-line-total">${formatPrice(item.price * item.quantity)}</span>
      </div>
      ${categoryMarkup}
      <div class="cart-item-footer">
        <div class="cart-quantity" aria-label="Quantity for ${item.name}">
          <button type="button" data-action="decrement" aria-label="Decrease quantity">−</button>
          <span aria-live="polite">${item.quantity}</span>
          <button type="button" data-action="increment" aria-label="Increase quantity">+</button>
        </div>
        <button class="cart-remove" type="button" data-action="remove">Remove</button>
      </div>
    `;
    return li;
  }

  function renderCart() {
    if (!cartItemsContainer || !cartCount || !cartTotal || !cartEmptyMessage || !checkoutButton) {
      return;
    }

    cartItemsContainer.innerHTML = '';
    let totalItems = 0;
    let totalCost = 0;

    cart.forEach((item) => {
      totalItems += item.quantity;
      totalCost += item.quantity * item.price;
      cartItemsContainer.appendChild(createCartItemElement(item));
    });

    cartCount.textContent = totalItems.toString();
    cartTotal.textContent = formatPrice(totalCost);

    const hasItems = cart.size > 0;
    cartEmptyMessage.hidden = hasItems;
    cartItemsContainer.hidden = !hasItems;
    checkoutButton.disabled = !hasItems;
  }

  function addItemToCart(button) {
    const name = button.dataset.product;
    const price = Number(button.dataset.price);
    if (!name || Number.isNaN(price)) return;

    const id = name.toLowerCase().replace(/\s+/g, '-');
    const existing = cart.get(id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.set(id, {
        id,
        name,
        category: button.dataset.category || '',
        price,
        quantity: 1,
      });
    }

    renderCart();
  }

  addToCartButtons.forEach((button) => {
    button.addEventListener('click', () => {
      addItemToCart(button);
      openCart();
    });
  });

  cartToggle?.addEventListener('click', () => {
    const isExpanded = cartToggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeCart();
    } else {
      openCart();
    }
  });

  cartClose?.addEventListener('click', () => {
    closeCart();
  });

  cartBackdrop?.addEventListener('click', () => {
    closeCart();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCart();
    }
  });

  cartItemsContainer?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const parentItem = target.closest('.cart-item');
    if (!parentItem) return;

    const itemId = parentItem.dataset.productId;
    if (!itemId || !cart.has(itemId)) return;

    const item = cart.get(itemId);
    if (!item) return;

    const action = target.dataset.action;
    if (action === 'increment') {
      item.quantity += 1;
    } else if (action === 'decrement') {
      item.quantity = Math.max(0, item.quantity - 1);
      if (item.quantity === 0) {
        cart.delete(itemId);
      }
    } else if (action === 'remove') {
      cart.delete(itemId);
    }

    renderCart();
  });

  checkoutButton?.addEventListener('click', () => {
    if (cart.size === 0) return;
    checkoutButton.textContent = 'Checkout (coming soon)';
    setTimeout(() => {
      checkoutButton.textContent = 'Checkout';
    }, 1500);
  });

  function updateTryonPlaceholder() {
    if (!tryonPlaceholder) return;
    if (!tryonHasPhoto) {
      tryonPlaceholder.textContent = 'Upload a photo to start your virtual try-on.';
      tryonPlaceholder.hidden = false;
      return;
    }
    if (!tryonSelectedStyle) {
      tryonPlaceholder.textContent = 'Select a hairstyle to layer it on your photo.';
      tryonPlaceholder.hidden = false;
      return;
    }
    tryonPlaceholder.hidden = true;
  }

  function updateTryonTransform() {
    if (!tryonOverlay) return;
    const scaleValue = tryonScale ? Number(tryonScale.value) : 100;
    const offsetXValue = tryonOffsetX ? Number(tryonOffsetX.value) : 0;
    const offsetYValue = tryonOffsetY ? Number(tryonOffsetY.value) : 0;
    tryonOverlay.style.setProperty('--tryon-scale', (scaleValue / 100).toFixed(2));
    tryonOverlay.style.setProperty('--tryon-offset-x', `${offsetXValue}px`);
    tryonOverlay.style.setProperty('--tryon-offset-y', `${offsetYValue}px`);
  }

  function syncTryonOverlay() {
    if (!tryonOverlay) return;
    if (!tryonSelectedStyle || !tryonHasPhoto) {
      tryonOverlay.hidden = true;
      updateTryonPlaceholder();
      return;
    }

    const styleData = hairstyleLibrary[tryonSelectedStyle];
    if (!styleData) {
      tryonOverlay.hidden = true;
      updateTryonPlaceholder();
      return;
    }

    tryonOverlay.src = styleData.src;
    tryonOverlay.alt = styleData.alt;
    tryonOverlay.hidden = false;
    updateTryonTransform();
    updateTryonPlaceholder();
  }

  function resetTryonControls() {
    if (tryonScale) tryonScale.value = '100';
    if (tryonOffsetX) tryonOffsetX.value = '0';
    if (tryonOffsetY) tryonOffsetY.value = '0';
    tryonStyleRadios.forEach((radio) => {
      radio.checked = false;
    });
    tryonSelectedStyle = '';
    updateTryonTransform();
  }

  function clearTryon() {
    tryonHasPhoto = false;
    resetTryonControls();
    if (tryonUpload) tryonUpload.value = '';
    if (tryonPhoto) {
      tryonPhoto.src = '';
      tryonPhoto.hidden = true;
    }
    if (tryonOverlay) {
      tryonOverlay.src = '';
      tryonOverlay.hidden = true;
    }
    if (tryonPlaceholder) {
      tryonPlaceholder.textContent = 'Upload a photo to start your virtual try-on.';
      tryonPlaceholder.hidden = false;
    }
  }

  tryonScale?.addEventListener('input', updateTryonTransform);
  tryonOffsetX?.addEventListener('input', updateTryonTransform);
  tryonOffsetY?.addEventListener('input', updateTryonTransform);

  tryonStyleRadios.forEach((radio) => {
    radio.addEventListener('change', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      tryonSelectedStyle = target.value;
      syncTryonOverlay();
    });
  });

  tryonUpload?.addEventListener('change', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      clearTryon();
      if (tryonPlaceholder) {
        tryonPlaceholder.textContent = 'Please select an image file to try on hairstyles.';
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (!tryonPhoto) return;
      tryonPhoto.src = typeof reader.result === 'string' ? reader.result : '';
      tryonPhoto.hidden = false;
      tryonHasPhoto = true;
      syncTryonOverlay();
      updateTryonPlaceholder();
    };
    reader.readAsDataURL(file);
  });

  tryonReset?.addEventListener('click', () => {
    clearTryon();
  });

  if (tryonPhoto) {
    tryonPhoto.addEventListener('load', () => {
      if (tryonPlaceholder) {
        tryonPlaceholder.hidden = true;
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const emailField = contactForm.querySelector('input[type="email"]');
      if (!(emailField instanceof HTMLInputElement)) return;

      const email = emailField.value.trim();
      if (!email) {
        emailField.focus();
        return;
      }

      contactForm.innerHTML = `<p class="form-success">Thanks ${email}! We'll follow up with recommendations shortly.</p>`;
    });
  }

  renderCart();
})();
