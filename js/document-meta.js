class DocumentMeta extends HTMLElement {

  static templateHTML = `
    <style>
      :host {
        display: block;
        font-size: 0.9em;
        text-align: center;
        padding: 0.5em;
        margin: 0 0 2em 0;
        background-color: #eee;
        border: 1px solid #666;
      }

      :host(.clear) {
        background-color: transparent;
      }

      p { margin: var(--p-margin); }
      .daysago { font-style: italic; }
      time, word-count { font-weight: bold; }

    </style>

    <p class="published">
      <slot name="published"></slot><time></time> &ndash;
      <span class="daysago"><span class="age"></span><slot name="age"></slot></span>
    </p>
    <p class="readtime">
      <word-count round="10"></word-count><slot name="words"></slot>
      <word-count minutes></word-count><slot name="minutes"></slot>
    </p>
  `;

  constructor() {

    super();

    // attach shadow root
    this.shadow = this.attachShadow({ mode: 'closed' });

    // defaults
    this.locale = document.documentElement.getAttribute('lang') || 'en-US';

  }

  // component attributes
  static get observedAttributes() {
    return ['published', 'locale', 'round', 'wpm'];
  }

  // attribute change
  attributeChangedCallback(property, oldValue, newValue) {

    if (oldValue === newValue) return;
    this[property] = newValue;

    this.render();

  }

  // connect component
  connectedCallback() {

    this.render();

  }

  // disconnect component
  disconnectedCallback() {
  }


  // render content
  render() {

    const localeNum = new Intl.NumberFormat( this.locale );

    const template = document.createElement('template');
    template.innerHTML = DocumentMeta.templateHTML;

    // publication date
    if (this.published) {

      const
        datePub = new Date( this.published ),
        dateFmt = new Intl.DateTimeFormat( this.locale, { dateStyle: 'long' } ).format( datePub ),
        age = localeNum.format( Math.ceil((new Date() - datePub) / (1000 * 60 * 60 * 24)) );

      this.updateDOM(
        template.content, 'time', dateFmt, { 'datetime': this.published }
      );

      this.updateDOM(
        template.content, '.age', age
      );

    }

    const wc = {
      locale: this.locale,
      round:  this.round || 100,
      wpm:    this.wpm || 200
    }

    this.updateDOM(
      template.content, 'word-count', null, wc
    );

    // update page
    this.shadow.innerHTML = '';
    this.shadow.append( template.content.cloneNode(true) );

  }


  // update element text and attributes
  updateDOM(doc, selector, textContent = '', attributes = {}) {

    Array.from( doc.querySelectorAll( selector ) )
      .forEach(node => {

        if (textContent) node.textContent = textContent;

        for (const p in attributes) {
          node.setAttribute(p, attributes[p]);
        }

      });

  }


}

// register component
window.customElements.define( 'document-meta', DocumentMeta );
