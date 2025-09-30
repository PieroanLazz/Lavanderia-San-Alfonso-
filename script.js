    // Variables globales
    let cart = [];
    let selectedDeliveryOption = 'recogida';

    // Funciones para el carrito
    function changeQuantity(button, change) {
      const quantityDisplay = button.parentElement.querySelector('.quantity-display');
      let quantity = parseInt(quantityDisplay.dataset.quantity) + change;
      quantity = Math.max(1, quantity);
      quantityDisplay.dataset.quantity = quantity;
      quantityDisplay.textContent = quantity;
    }

    function addToCart(button, serviceName, price) {
      const card = button.closest('.service-card');
      const quantityDisplay = card.querySelector('.quantity-display');
      const descriptionInput = card.querySelector('.description-input');
      const quantity = parseInt(quantityDisplay.dataset.quantity);
      const description = descriptionInput.value.trim();
      
      const existingItem = cart.find(item => item.name === serviceName && item.description === description);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          name: serviceName,
          price: price,
          quantity: quantity,
          description: description || 'Sin descripción específica'
        });
      }
      
      updateCartDisplay();
      showFloatingCart();
      
      quantityDisplay.dataset.quantity = 1;
      quantityDisplay.textContent = 1;
      descriptionInput.value = '';
      
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="fas fa-check"></i> ¡Agregado!';
      button.style.background = '#2E7D32';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
      }, 2000);
    }

    function updateCartDisplay() {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      document.getElementById('cartBadge').textContent = totalItems;
      document.getElementById('totalAmount').textContent = totalAmount.toFixed(2);
      
      const cartItemsContainer = document.getElementById('cartItems');
      cartItemsContainer.innerHTML = '';
      
      if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 1rem;">Tu carrito está vacío</p>';
      } else {
        cart.forEach((item, index) => {
          cartItemsContainer.innerHTML += `
            <div class="cart-item">
              <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <div class="cart-item-controls">
                  <button class="cart-quantity-btn" onclick="updateItemQuantity(${index}, -1)">-</button>
                  <span>${item.quantity}</span>
                  <button class="cart-quantity-btn" onclick="updateItemQuantity(${index}, 1)">+</button>
                </div>
              </div>
              <div class="cart-item-price">S/. ${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          `;
        });
      }
    }

    function updateItemQuantity(index, change) {
      cart[index].quantity = Math.max(0, cart[index].quantity + change);
      
      if (cart[index].quantity === 0) {
        cart.splice(index, 1);
      }
      
      updateCartDisplay();
      
      if (cart.length === 0) {
        hideFloatingCart();
      }
    }

    function showFloatingCart() {
      document.getElementById('floatingCart').style.display = 'flex';
    }

    function hideFloatingCart() {
      document.getElementById('floatingCart').style.display = 'none';
    }

    function openCart() {
      document.getElementById('cartModal').style.display = 'flex';
    }

    function closeCart() {
      document.getElementById('cartModal').style.display = 'none';
    }

    function openCustomerForm() {
      if (cart.length === 0) return;
      
      closeCart();
      document.getElementById('customerFormModal').style.display = 'flex';
    }

    function closeCustomerForm() {
      document.getElementById('customerFormModal').style.display = 'none';
      openCart();
    }

    function selectDeliveryOption(option) {
      selectedDeliveryOption = option;
      
      // Remove selected class from all options
      document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
      });
      
      // Add selected class to the clicked option
      document.querySelector(`.payment-option[onclick="selectDeliveryOption('${option}')"]`).classList.add('selected');
    }

    function sendWhatsAppOrder() {
      if (cart.length === 0) return;
      
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const phone = document.getElementById('phone').value;
      const location = document.getElementById('location').value;
      const notes = document.getElementById('notes').value;
      
      if (!firstName || !lastName || !phone || !location) {
        alert('Por favor, completa todos los campos obligatorios (*)');
        return;
      }
      
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      let message = `¡Hola! Soy *${firstName} ${lastName}* y quiero solicitar los siguientes servicios de Lavandería San Alfonso:\n\n`;
      
      cart.forEach(item => {
        message += `🧼 *${item.name}*\n`;
        message += `   Cantidad: ${item.quantity}\n`;
        message += `   Precio estimado: S/. ${(item.price * item.quantity).toFixed(2)}\n`;
        message += `   Detalles: ${item.description}\n\n`;
      });
      
      message += `💰 *Total estimado: S/. ${total.toFixed(2)}*\n\n`;
      message += `*Información de contacto:*\n`;
      message += `📞 Teléfono: ${phone}\n`;
      message += `📍 Ubicación: ${location}\n`;
      message += `🚚 Preferencia de entrega: ${selectedDeliveryOption === 'recogida' ? 'Recogida a domicilio' : 'Recojo en local'}\n`;
      
      if (notes) {
        message += `📝 Instrucciones especiales: ${notes}\n`;
      }
      
      message += `\n*Nota:* El precio final será confirmado después de pesar la ropa.\n\n`;
      message += `¿Podrían confirmar la disponibilidad y coordinar el servicio? ¡Gracias!`;
      
      const whatsappUrl = `https://wa.me/51994806349?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      // Reset form and cart
      document.getElementById('customerForm').reset();
      cart = [];
      updateCartDisplay();
      hideFloatingCart();
      closeCustomerForm();
    }

    // Event Listeners
    document.getElementById('customerForm').addEventListener('submit', function(e) {
      e.preventDefault();
      sendWhatsAppOrder();
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.querySelector('.nav-overlay');

    mobileMenuBtn.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      navOverlay.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    navOverlay.addEventListener('click', function() {
      navLinks.classList.remove('active');
      navOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          this.style.display = 'none';
        }
      });
    });

    // Animations on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.slide-in-up').forEach(el => {
      observer.observe(el);
    });

    // Touch improvements for mobile
    document.addEventListener('touchstart', function() {}, {passive: true});

    // Prevent zoom on double tap (iOS)
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Initialize delivery option
    selectDeliveryOption('recogida');