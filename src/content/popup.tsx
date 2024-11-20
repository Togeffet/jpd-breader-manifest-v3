import { browser, clamp, nonNull } from '../util.js';
import { jsxCreateElement } from '../jsx.js';
import { requestMine, requestReview, requestSetFlag } from './service_worker_comms.js';
import { Dialog } from './dialog.js';
import { getSentences, JpdbWord, JpdbWordData } from './word.js';
import { PARTS_OF_SPEECH } from '../constants.js';
import { loadConfig } from '../config.js';

const config = await loadConfig();

function getClosestClientRect(elem: HTMLElement, x: number, y: number): DOMRect {
  const rects = elem.getClientRects();

  if (rects.length === 1) return rects[0];

  // Merge client rects that are adjacent
  // This works around a Chrome issue, where sometimes, non-deterministically,
  // inline child elements will get separate client rects, even if they are on the same line.

  const { writingMode } = getComputedStyle(elem);
  const horizontal = writingMode.startsWith('horizontal');

  const mergedRects: DOMRect[] = [];
  for (const rect of rects) {
    if (mergedRects.length === 0) {
      mergedRects.push(rect);
      continue;
    }

    const prevRect = mergedRects[mergedRects.length - 1];

    if (horizontal) {
      if (rect.bottom === prevRect.bottom && rect.left === prevRect.right) {
        mergedRects[mergedRects.length - 1] = new DOMRect(
          prevRect.x,
          prevRect.y,
          rect.right - prevRect.left,
          prevRect.height,
        );
      } else {
        mergedRects.push(rect);
      }
    } else {
      if (rect.right === prevRect.right && rect.top === prevRect.bottom) {
        mergedRects[mergedRects.length - 1] = new DOMRect(
          prevRect.x,
          prevRect.y,
          prevRect.width,
          rect.bottom - prevRect.top,
        );
      } else {
        mergedRects.push(rect);
      }
    }
  }

  // Debugging this was a nightmare, so I'm leaving this debug code here

  // console.log(rects);
  // console.log(mergedRects);

  // document.querySelectorAll('Rect').forEach(x => x.parentElement?.removeChild(x));
  // document.body.insertAdjacentHTML(
  //     'beforeend',
  //     mergedRects
  //         .map(
  //             (rect, i) =>
  //                 `<Rect style="position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;background-color:rgba(255,0,0,0.3);box-sizing:border-box;border:solid black 1px;pointer-events:none;">${i}</Rect>`,
  //         )
  //         .join(''),
  // );

  return mergedRects
    .map(rect => ({
      rect,
      distance: Math.max(rect.left - x, 0, x - rect.right) ** 2 + Math.max(rect.top - y, 0, y - rect.bottom) ** 2,
    }))
    .reduce((a, b) => (a.distance <= b.distance ? a : b)).rect;
}

function renderPitch(reading: string, pitch: string) {
  if (reading.length != pitch.length - 1) {
    return <span>Error: invalid pitch</span>;
  }

  try {
    const parts: HTMLSpanElement[] = [];
    let lastBorder = 0;
    const borders = Array.from(pitch.matchAll(/L(?=H)|H(?=L)/g), x => nonNull(x.index) + 1);
    let low = pitch[0] === 'L';

    for (const border of borders) {
      parts.push(<span class={low ? 'low' : 'high'}>{reading.slice(lastBorder, border)}</span>);
      lastBorder = border;
      low = !low;
    }

    if (lastBorder != reading.length) {
      // No switch after last part
      parts.push(<span class={low ? 'low-final' : 'high-final'}>{reading.slice(lastBorder)}</span>);
    }

    return <span class='pitch'>{parts}</span>;
  } catch (error) {
    console.error(error);
    return <span>Error: invalid pitch</span>;
  }
}

export class Popup {
  #demoMode: boolean;
  #element: HTMLElement;
  #customStyle: HTMLElement;
  #outerStyle: CSSStyleDeclaration;
  #vocabSection: HTMLElement;
  #mineButtons: HTMLElement;
  #originalLinkArea: HTMLElement;
  #data: JpdbWordData;

  static #popup: Popup;

  static get(): Popup {
    if (!this.#popup) {
      this.#popup = new this();
      document.body.append(this.#popup.#element);
    }

    return this.#popup;
  }

  static getDemoMode(parent: HTMLElement): Popup {
    const popup = new this(true);
    parent.append(popup.#element);
    return popup;
  }

  constructor(demoMode = false) {
    this.#demoMode = demoMode;

    this.#element = (
      <div
        id='jpdb-popup'
        onmousedown={event => {
          event.stopPropagation();
        }}
        onclick={event => {
          event.stopPropagation();
        }}
        onwheel={event => {
          event.stopPropagation();
        }}
        style={`all:initial;z-index:2147483647;${
          demoMode ? '' : 'position:absolute;top:0;left:0;opacity:0;visibility:hidden;'
        };`}></div>
    );

    const shadow = this.#element.attachShadow({ mode: 'closed' });

    shadow.append(
      <link rel='stylesheet' href={browser.runtime.getURL('/themes.css')} />,
      <link rel='stylesheet' href={browser.runtime.getURL('/content/popup.css')} />,
      (this.#customStyle = <style></style>),
      <article lang='ja'>
        {config.gradeButtonsAtBottom ? (this.#vocabSection = <section id='vocab-content'></section>) : ''}
        {config && config.gradeButtonsAtBottom
          ? (this.#originalLinkArea = <section id='original-link-area'></section>)
          : ''}
        {(this.#mineButtons = <section id='mine-buttons'></section>)}
        <section id='review-buttons'>
          <button
            class='nothing'
            onclick={
              demoMode
                ? undefined
                : async () => {
                    await requestReview(this.#data.token.card, 'nothing');
                  }
            }>
            {config && config.useShorterButtonNames ? 'None' : 'Nothing'}
          </button>
          <button
            class='something'
            onclick={
              demoMode
                ? undefined
                : async () => {
                    await requestReview(this.#data.token.card, 'something');
                  }
            }>
            {config && config.useShorterButtonNames ? 'Some' : 'Something'}
          </button>
          <button
            class='hard'
            onclick={
              demoMode
                ? undefined
                : async () => {
                    if (config && !config.disablePopupAutoClose) {
                      this.fadeOut();
                    }
                    await requestReview(this.#data.token.card, 'hard');
                  }
            }>
            Hard
          </button>
          <button
            class='good'
            onclick={
              demoMode
                ? undefined
                : async () => {
                    if (config && !config.disablePopupAutoClose) {
                      this.fadeOut();
                    }
                    await requestReview(this.#data.token.card, 'good');
                  }
            }>
            Good
          </button>
          <button
            class='easy'
            onclick={
              demoMode
                ? undefined
                : async () => {
                    if (config && !config.disablePopupAutoClose) {
                      this.fadeOut();
                    }
                    await requestReview(this.#data.token.card, 'easy');
                  }
            }>
            Easy
          </button>
        </section>
        {!config || !config.gradeButtonsAtBottom ? (this.#vocabSection = <section id='vocab-content'></section>) : ''}
        {!config || !config.gradeButtonsAtBottom
          ? (this.#originalLinkArea = <section id='original-link-area'></section>)
          : ''}
      </article>,
    );

    this.#outerStyle = this.#element.style;

    // Close out popup if clicking/tapping on non-button
    this.#vocabSection.addEventListener('click', e => {
      const target_classlist = (e.target as HTMLElement).classList;
      if (
        config &&
        config.closeOnPopupClick &&
        !target_classlist.contains('spelling') &&
        !target_classlist.contains('reading')
      ) {
        this.fadeOut();
      }
    });
  }

  fadeIn() {
    // Necessary because in settings page, config is undefined
    // TODO is this still true? ~hmry(2023-08-08)
    if (config && !config.disableFadeAnimation) {
      this.#outerStyle.transition = 'opacity 60ms ease-in, visibility 60ms';
    }
    this.#outerStyle.opacity = '1';
    this.#outerStyle.visibility = 'visible';
  }

  fadeOut() {
    // Necessary because in settings page, config is undefined
    // TODO is this still true? ~hmry(2023-08-08)
    if (config && !config.disableFadeAnimation) {
      this.#outerStyle.transition = 'opacity 200ms ease-in, visibility 200ms';
    }
    this.#outerStyle.opacity = '0';
    this.#outerStyle.visibility = 'hidden';
  }

  disablePointer() {
    this.#outerStyle.pointerEvents = 'none';
    this.#outerStyle.userSelect = 'none';
  }

  enablePointer() {
    this.#outerStyle.pointerEvents = '';
    this.#outerStyle.userSelect = '';
  }

  render() {
    if (this.#data === undefined) return;

    const card = this.#data.token.card;

    const url = `https://jpdb.io/vocabulary/${card.vid}/${encodeURIComponent(card.spelling)}/${encodeURIComponent(
      card.reading,
    )}`;

    // Group meanings by part of speech
    const groupedMeanings: { partOfSpeech: string[]; glosses: string[][]; startIndex: number }[] = [];
    let lastPOS: string[] = [];
    for (const [index, meaning] of card.meanings.entries()) {
      if (
        // Same part of speech as previous meaning?
        meaning.partOfSpeech.length == lastPOS.length &&
        meaning.partOfSpeech.every((p: string, i: number) => p === lastPOS[i])
      ) {
        // Append to previous meaning group
        groupedMeanings[groupedMeanings.length - 1].glosses.push(meaning.glosses);
      } else {
        // Create a new meaning group
        groupedMeanings.push({
          partOfSpeech: meaning.partOfSpeech,
          glosses: [meaning.glosses],
          startIndex: index,
        });
        lastPOS = meaning.partOfSpeech;
      }
    }

    this.#vocabSection.replaceChildren(
      <div id='header'>
        <a lang='ja' href={url} target='_blank'>
          <span class='spelling'>{card.spelling}</span>
          <span class='reading'>{card.spelling !== card.reading ? `(${card.reading})` : ''}</span>
        </a>
        <div class='state'>
          {card.state.map((s: string | undefined) => (
            <span class={s}>{s}</span>
          ))}
        </div>
      </div>,
      <div class='metainfo'>
        <span class='freq'>{card.frequencyRank ? `Top ${card.frequencyRank}` : ''}</span>
        {card.pitchAccent.map((pitch: string) => renderPitch(card.reading, pitch))}
      </div>,
      ...groupedMeanings.flatMap(meanings => [
        <h2>
          {meanings.partOfSpeech
            .map(pos => PARTS_OF_SPEECH[pos] ?? `(Unknown part of speech #${pos}, please report)`)
            .filter(x => x.length > 0)
            .join(', ')}
        </h2>,
        <ol start={meanings.startIndex + 1}>
          {meanings.glosses.map(glosses => (
            <li>{glosses.join('; ')}</li>
          ))}
        </ol>,
      ]),
    );

    const blacklisted = card.state.includes('blacklisted');
    const neverForget = card.state.includes('never-forget');

    this.#mineButtons.replaceChildren(
      <button
        class='add'
        onclick={
          this.#demoMode
            ? undefined
            : () =>
                requestMine(
                  this.#data.token.card,
                  config.forqOnMine,
                  getSentences(this.#data, config.contextWidth).trim() || undefined,
                  undefined,
                )
        }>
        Add
      </button>,
      <button class='edit-add-review' onclick={this.#demoMode ? undefined : () => Dialog.get().showForWord(this.#data)}>
        Edit, Add and Review...
      </button>,
      <button
        class='blacklist'
        onclick={
          this.#demoMode
            ? undefined
            : async () => await requestSetFlag(this.#data.token.card, 'blacklist', !blacklisted)
        }>
        {!blacklisted ? 'Blacklist' : 'Remove from blacklist'}
      </button>,
      <button
        class='never-forget'
        onclick={
          this.#demoMode
            ? undefined
            : async () => await requestSetFlag(this.#data.token.card, 'never-forget', !neverForget)
        }>
        {!neverForget ? 'Never forget' : 'Unmark as never forget'}
      </button>,
    );
  }

  setData(data: JpdbWordData) {
    this.#data = data;
    this.render();
  }

  setOriginalLink(href: string | null) {
    if (href) {
      let title = href.replace('https://', '').replace('www.', ''); //.substring(0, 20);
      if (title.length > 20) {
        title = `${title.substring(0, 20)}...`;
      }

      this.#originalLinkArea.replaceChildren(
        <div>
          <a href={href}>orig. link: {title}</a>
        </div>,
      );
    } else {
      this.#originalLinkArea.style.display = 'none';
      this.#originalLinkArea.replaceChildren(<div></div>);
    }
  }

  containsMouse(event: MouseEvent): boolean {
    const targetElement = event.target as HTMLElement;

    if (targetElement) {
      return this.#element.contains(targetElement);
    }

    return false;
  }

  showForWord(word: JpdbWord, mouseX = 0, mouseY = 0) {
    this.setOriginalLink((word as HTMLElement).getAttribute('original-link'));
    const data = word.jpdbData;
    this.setData(data); // Because we need the dimensions of the popup with the new data

    const bbox = getClosestClientRect(word, mouseX, mouseY);

    const wordLeft = window.scrollX + bbox.left;
    const wordTop = window.scrollY + bbox.top;
    const wordRight = window.scrollX + bbox.right;
    const wordBottom = window.scrollY + bbox.bottom;

    const leftSpace = bbox.left;
    const topSpace = bbox.top;
    const rightSpace = document.documentElement.clientWidth - bbox.right;
    const bottomSpace = document.documentElement.clientHeight - bbox.bottom;

    const popupHeight = this.#element.offsetHeight;
    const popupWidth = this.#element.offsetWidth;

    const minLeft = window.scrollX;
    const maxLeft = window.scrollX + document.documentElement.clientWidth - popupWidth;
    const minTop = window.scrollY;
    const maxTop = window.scrollY + document.documentElement.clientHeight - popupHeight;

    let popupLeft: number;
    let popupTop: number;

    const { writingMode } = getComputedStyle(word);

    if (writingMode.startsWith('horizontal')) {
      if (config.prioritizePopupAboveWord) {
        popupTop = clamp(popupHeight <= topSpace ? wordTop - popupHeight : wordBottom, minTop, maxTop);
      } else {
        popupTop = clamp(bottomSpace > topSpace ? wordBottom : wordTop - popupHeight, minTop, maxTop);
      }
      popupLeft = clamp(rightSpace > leftSpace ? wordLeft : wordRight - popupWidth, minLeft, maxLeft);
    } else {
      popupTop = clamp(bottomSpace > topSpace ? wordTop : wordBottom - popupHeight, minTop, maxTop);

      if (config.prioritizePopupToRightOfWord) {
        popupLeft = clamp(popupWidth <= rightSpace ? wordRight : wordLeft - popupWidth, minLeft, maxLeft);
      } else {
        popupLeft = clamp(rightSpace > leftSpace ? wordRight : wordLeft - popupWidth, minLeft, maxLeft);
      }
    }

    this.#outerStyle.transform = `translate(${popupLeft}px,${popupTop}px)`;

    this.fadeIn();
  }

  updateStyle(newCSS = config.customPopupCSS) {
    this.#customStyle.textContent = newCSS;
  }
}
