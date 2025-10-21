(function(){
  const doc = document;
  if (!doc) return;
  const root = doc.documentElement;
  if (!root) return;
  const siteKey = root.getAttribute('data-recaptcha-site-key');
  if (!siteKey) return;

  const MAX_ATTEMPTS = 40;
  const RETRY_DELAY = 125;

  function waitForEnterprise(){
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const step = () => {
        const api = window.grecaptcha;
        if (api && api.enterprise) {
          try {
            api.enterprise.ready(resolve);
          } catch (error) {
            reject(error);
          }
          return;
        }
        if (attempts >= MAX_ATTEMPTS) {
          reject(new Error('reCAPTCHA Enterprise no disponible'));
          return;
        }
        attempts += 1;
        window.setTimeout(step, RETRY_DELAY);
      };
      step();
    });
  }

  const manager = {
    siteKey,
    lastToken: null,
    lastForm: null,
    lastButton: null,
    _readyPromise: null,
    ready() {
      if (!this._readyPromise) {
        this._readyPromise = waitForEnterprise();
      }
      return this._readyPromise;
    },
    async execute(action = 'submit') {
      await this.ready();
      const token = await window.grecaptcha.enterprise.execute(siteKey, { action });
      this.lastToken = token;
      doc.dispatchEvent(new CustomEvent('apollo:recaptcha-token', {
        detail: { token, action }
      }));
      return token;
    },
    injectToken(form, token) {
      if (!form) return;
      let input = form.querySelector("input[name='g-recaptcha-response']");
      if (!input) {
        input = form.ownerDocument.createElement('input');
        input.type = 'hidden';
        input.name = 'g-recaptcha-response';
        form.appendChild(input);
      }
      input.value = token;
    },
    submitForm(form, button) {
      if (!form) return;
      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit(button || undefined);
      } else {
        form.submit();
      }
    },
    bindButtons() {
      const buttons = doc.querySelectorAll('.g-recaptcha[data-sitekey]');
      buttons.forEach((button) => {
        if (button.dataset.recaptchaBound === 'true') return;
        button.dataset.recaptchaBound = 'true';
        button.addEventListener('click', async (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          const formId = button.getAttribute('data-recaptcha-form');
          const form = formId ? doc.getElementById(formId) : button.closest('form');
          const explicitAction = button.getAttribute('data-action') || button.getAttribute('data-recaptcha-action');
          const inferredAction = form?.getAttribute('data-recaptcha-action');
          const action = explicitAction || inferredAction || 'submit';
          this.lastForm = form || null;
          this.lastButton = button;
          try {
            const token = await this.execute(action);
            const context = { token, action, button, form, manual: false };
            if (typeof window.onRecaptchaSubmit === 'function') {
              const result = window.onRecaptchaSubmit(token, context);
              if (result === false) return;
            } else if (form) {
              this.injectToken(form, token);
            }
            if (form) {
              this.submitForm(form, button);
            }
          } catch (error) {
            console.error('No se pudo completar reCAPTCHA:', error);
            button.dispatchEvent(new CustomEvent('recaptchaerror', { detail: error }));
          }
        }, { passive: false });
      });
    }
  };

  window.ApolloRecaptcha = manager;

  window.onRecaptchaSubmit = function(token, context = {}) {
    const form = context.form || manager.lastForm;
    if (form) {
      manager.injectToken(form, token);
    }
    manager.lastToken = token;
    if (context.manual) {
      return;
    }
    const button = context.button || manager.lastButton || null;
    if (form) {
      manager.submitForm(form, button);
    }
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', () => manager.bindButtons(), { once: true });
  } else {
    manager.bindButtons();
  }
})();
