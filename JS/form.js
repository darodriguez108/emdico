
    // Contact form submission handler that posts to the email relay API without opening an email client
    (function () {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const endpoint = form.dataset.endpoint || '/api/contact';
        const submitButton = form.querySelector('button[type="submit"]');

        let statusMessage = form.querySelector('.form-status');
        if (!statusMessage) {
            statusMessage = document.createElement('p');
            statusMessage.className = 'form-status';
            statusMessage.setAttribute('role', 'status');
            statusMessage.setAttribute('aria-live', 'polite');
            form.appendChild(statusMessage);
        }

        function setStatus(text, type) {
            statusMessage.textContent = text;
            statusMessage.dataset.state = type;
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.dataset.originalText = submitButton.dataset.originalText || submitButton.textContent;
                submitButton.textContent = 'Enviando…';
            }

            const payload = {
                name: document.getElementById('name')?.value.trim() || '',
                empresa: document.getElementById('empresa')?.value.trim() || '',
                telefono: document.getElementById('telefono')?.value.trim() || '',
                email: document.getElementById('email')?.value.trim() || '',
                message: document.getElementById('message')?.value.trim() || '',
            };

            setStatus('Enviando tu mensaje…', 'pending');

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const result = await response.json().catch(() => ({}));

                if (!response.ok || result.error) {
                    throw new Error(result.error || 'No se pudo enviar el correo.');
                }

                setStatus('¡Gracias! Tu mensaje fue enviado correctamente.', 'success');
                form.reset();
            } catch (error) {
                console.error('Error al enviar el formulario', error);
                setStatus('No pudimos enviar tu mensaje. Intenta de nuevo más tarde o contáctanos directamente.', 'error');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = submitButton.dataset.originalText || 'Enviar';
                }
            }
        });
    })();
