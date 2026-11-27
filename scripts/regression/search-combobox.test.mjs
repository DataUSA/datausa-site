/**
 * Browser tests of the search autocomplete (src/components/search/SearchBox.tsx): keyboard use,
 * focus, choosing, dismissing, scrolling and the loading, empty and error states, on a running
 * site.
 *
 *   npm run test:search                       # against http://localhost:3301
 *   BASE_URL=http://localhost:3302 npm run test:search
 *
 * The suggestions come from the site's own `/api/search`; each test reads the response it waited
 * for, so the expectations follow the data rather than fixed names.
 */
import assert from "node:assert/strict";
import {after, before, describe, test} from "node:test";
import {chromium} from "playwright";

const BASE = (process.env.BASE_URL ?? "http://localhost:3301").replace(/\/$/, "");
const NAV_TIMEOUT = 90_000;

let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser?.close(); });

/** React has attached its handlers to the element (typing before that would be lost). */
const hydrated = (page, selector) => page.waitForFunction(
  sel => { const el = document.querySelector(sel); return Boolean(el) && Object.keys(el).some(k => k.startsWith("__reactProps")); },
  selector,
  {timeout: NAV_TIMEOUT}
);

/** Opens a page once the navigation, and the page's own search box if it has one, respond. */
async function open(path, viewport = {width: 1280, height: 800}) {
  const page = await browser.newPage({viewport});
  await page.goto(`${BASE}${path}`, {waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT});
  await hydrated(page, "nav#Nav button[aria-label=Search]");
  if (await page.locator("main [role=combobox]").count()) await hydrated(page, "main [role=combobox]");
  return page;
}

/** The page's main search box (not the navigation's). */
const mainBox = page => page.locator("main [role=combobox]").first();

/** Types `text` into `input` and waits for the suggestions for it to be shown; returns them. */
async function typeAndWait(page, input, text) {
  const response = page.waitForResponse(r => r.url().includes("/api/search?") && new URL(r.url()).searchParams.get("q") === text, {timeout: NAV_TIMEOUT});
  await input.pressSequentially(text);
  const results = (await (await response).json()).results;
  const listbox = page.locator(`#${await input.getAttribute("aria-controls")}`.replace(/:/g, "\\:"));
  if (results.length) await listbox.locator("[role=option]").nth(results.length - 1).waitFor();
  return {results, listbox};
}

const href = hit => `/profile/${hit.profile}/${hit.slug || hit.id}`;
const activeId = input => input.getAttribute("aria-activedescendant");
const optionIds = listbox => listbox.locator("[role=option]").evaluateAll(els => els.map(e => e.id));
const focusedRole = page => page.evaluate(() => document.activeElement?.getAttribute("role"));

describe("search autocomplete", () => {
  test("has the combobox semantics (role, name, popup relation, no tab stops in the list)", async () => {
    const page = await open("/reports");
    const input = mainBox(page);
    assert.equal(await input.getAttribute("aria-autocomplete"), "list");
    assert.equal(await input.getAttribute("aria-expanded"), "false");
    assert.ok(await input.getAttribute("aria-label"), "the input has an accessible name");
    const {results, listbox} = await typeAndWait(page, input, "jo");
    assert.ok(results.length >= 3, "enough suggestions for the tests");
    assert.equal(await input.getAttribute("aria-expanded"), "true");
    assert.equal(await listbox.getAttribute("role"), "listbox");
    assert.equal(await listbox.locator("[role=option]").count(), results.length);
    assert.equal(await listbox.locator("button, a, [tabindex]").count(), 0, "suggestions are not tab stops");
    assert.equal(await activeId(input), null, "nothing is highlighted until an arrow key is pressed");
    await page.close();
  });

  test("1. ArrowDown three times then Enter opens the third suggestion", async () => {
    const page = await open("/reports");
    const input = mainBox(page);
    const {results, listbox} = await typeAndWait(page, input, "jo");
    for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowDown");
    const ids = await optionIds(listbox);
    assert.equal(await activeId(input), ids[2]);
    assert.equal(await listbox.locator("[aria-selected=true]").count(), 1);
    assert.equal(await listbox.locator("[role=option]").nth(2).getAttribute("aria-selected"), "true");
    assert.equal(await focusedRole(page), "combobox", "focus stays in the input");
    await page.keyboard.press("Enter");
    await page.waitForURL(`${BASE}${href(results[2])}`, {timeout: NAV_TIMEOUT});
    await page.close();
  });

  test("2. a suggestion below the visible part of the list is scrolled into view, the page is not", async () => {
    const page = await open("/reports");
    const input = mainBox(page);
    const {results, listbox} = await typeAndWait(page, input, "jo");
    const scrollY = await page.evaluate(() => window.scrollY);
    const fits = await listbox.evaluate(el => el.scrollHeight > el.clientHeight);
    assert.ok(fits, "the list is capped and scrolls (about six suggestions show)");
    for (let i = 0; i < results.length; i++) await page.keyboard.press("ArrowDown");
    const last = listbox.locator("[role=option]").nth(results.length - 1);
    const [box, item] = await Promise.all([listbox.boundingBox(), last.boundingBox()]);
    assert.ok(item.y >= box.y - 1 && item.y + item.height <= box.y + box.height + 1, "the last suggestion is inside the list's visible area");
    assert.ok(await listbox.evaluate(el => el.scrollTop) > 0);
    assert.equal(await page.evaluate(() => window.scrollY), scrollY, "the page did not scroll");
    // and round again to the first, at the top
    await page.keyboard.press("ArrowDown");
    assert.equal(await activeId(input), (await optionIds(listbox))[0]);
    assert.equal(await listbox.evaluate(el => el.scrollTop), 0);
    // ArrowUp from the first goes round to the last
    await page.keyboard.press("ArrowUp");
    assert.equal(await activeId(input), (await optionIds(listbox))[results.length - 1]);
    // the list fits in the window
    const popupBottom = await listbox.evaluate(el => el.getBoundingClientRect().bottom);
    assert.ok(popupBottom <= await page.evaluate(() => window.innerHeight));
    await page.close();
  });

  test("3. Escape closes the list and leaves the text and the focus in the input", async () => {
    const page = await open("/reports");
    const input = mainBox(page);
    const {listbox} = await typeAndWait(page, input, "jo");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Escape");
    assert.equal(await input.inputValue(), "jo");
    assert.equal(await input.getAttribute("aria-expanded"), "false");
    assert.equal(await activeId(input), null);
    assert.ok(await listbox.isHidden());
    assert.equal(await focusedRole(page), "combobox");
    assert.equal(new URL(page.url()).pathname, "/reports", "nothing was opened");
    // ArrowDown opens it again, on the first suggestion; ArrowUp on a closed list starts at the last
    await page.keyboard.press("ArrowDown");
    assert.equal(await activeId(input), (await optionIds(listbox))[0]);
    await page.keyboard.press("Escape");
    await page.keyboard.press("ArrowUp");
    const ids = await optionIds(listbox);
    assert.equal(await activeId(input), ids[ids.length - 1]);
    await page.close();
  });

  test("4. Tab moves to the Search button without choosing a suggestion", async () => {
    const page = await open("/reports");
    const input = mainBox(page);
    const {listbox} = await typeAndWait(page, input, "jo");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => ({tag: document.activeElement?.tagName, href: document.activeElement?.getAttribute("href"), text: document.activeElement?.textContent}));
    assert.equal(focused.tag, "A");
    assert.equal(focused.text, "Search");
    assert.equal(focused.href, "/search?q=jo");
    assert.ok(await listbox.isHidden());
    assert.equal(await input.inputValue(), "jo");
    assert.equal(new URL(page.url()).pathname, "/reports");
    // the Search button works from the keyboard
    await page.keyboard.press("Enter");
    await page.waitForURL(u => new URL(u).pathname === "/search" && new URL(u).searchParams.get("q") === "jo", {timeout: NAV_TIMEOUT});
    await page.close();
  });

  test("5. Shift+Tab moves focus back without choosing a suggestion", async () => {
    const page = await open("/reports");
    const input = mainBox(page);
    const {listbox} = await typeAndWait(page, input, "jo");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Shift+Tab");
    assert.notEqual(await focusedRole(page), "combobox", "focus left the input");
    assert.equal(await page.evaluate(() => Boolean(document.activeElement?.closest("[role=listbox]"))), false);
    assert.ok(await listbox.isHidden());
    assert.equal(new URL(page.url()).pathname, "/reports");
    await page.close();
  });

  test("6. a click on a suggestion opens it, and the press keeps the focus in the input", async () => {
    const page = await open("/reports");
    const input = mainBox(page);
    const {results, listbox} = await typeAndWait(page, input, "jo");
    const option = listbox.locator("[role=option]").nth(1);
    const box = await option.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    assert.equal(await focusedRole(page), "combobox", "pressing a suggestion does not blur the input");
    await page.mouse.up();
    await page.waitForURL(`${BASE}${href(results[1])}`, {timeout: NAV_TIMEOUT});
    await page.close();
  });

  test("6b. pointer hover does not move the keyboard highlight", async () => {
    const page = await open("/reports");
    const input = mainBox(page);
    const {listbox} = await typeAndWait(page, input, "jo");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    const ids = await optionIds(listbox);
    await listbox.locator("[role=option]").nth(4).hover();
    assert.equal(await activeId(input), ids[1]);
    assert.equal(await listbox.locator("[aria-selected=true]").getAttribute("id"), ids[1]);
    await page.close();
  });

  test("7. no results, and suggestions that change as the text does", async () => {
    const page = await open("/reports");
    const input = mainBox(page);
    const none = await typeAndWait(page, input, "zzqxjv");
    assert.equal(none.results.length, 0);
    const message = page.locator("main [data-search-message]");
    await message.waitFor();
    assert.match(await message.textContent(), /No reports match “zzqxjv”/);
    assert.equal(await input.getAttribute("aria-expanded"), "false", "no list to expand");
    assert.match(await page.locator("main [role=status]").first().textContent(), /No reports match/);
    // clear and type again: new suggestions, highlight reset on every change
    await input.fill("");
    assert.ok(await message.isHidden());
    const bos = await typeAndWait(page, input, "bos");
    await page.keyboard.press("ArrowDown");
    assert.ok(await activeId(input));
    const response = page.waitForResponse(r => r.url().includes("/api/search?") && new URL(r.url()).searchParams.get("q") === "bost", {timeout: NAV_TIMEOUT});
    await input.press("t");
    assert.equal(await activeId(input), null, "typing resets the highlight");
    const bost = (await (await response).json()).results;
    await bos.listbox.locator("[role=option]").first().getByText(bost[0].name, {exact: true}).waitFor();
    assert.match(await page.locator("main [role=status]").first().textContent(), new RegExp(`${bost.length} suggestion`));
    // Backspace filters again
    const back = page.waitForResponse(r => r.url().includes("/api/search?") && new URL(r.url()).searchParams.get("q") === "bos", {timeout: NAV_TIMEOUT});
    await input.press("Backspace");
    await back;
    assert.equal(await input.inputValue(), "bos");
    await page.close();
  });

  test("7b. loading and error states", async () => {
    const page = await open("/reports");
    const input = mainBox(page);
    let release;
    const held = new Promise(resolve => { release = resolve; });
    await page.route("**/api/search?*", async route => { await held; await route.fulfill({status: 500, body: "{}"}); });
    await input.pressSequentially("jo");
    const message = page.locator("main [data-search-message]");
    await message.waitFor();
    assert.equal(await message.textContent(), "Searching…");
    release();
    await page.locator("main [data-search-message=error]").waitFor();
    assert.match(await message.textContent(), /unavailable/);
    assert.match(await page.locator("main [role=status]").first().textContent(), /unavailable/);
    await page.close();
  });

  test("8. keyboard only: the navigation's search, from the S key to a report", async () => {
    const page = await open("/about/background");
    await page.keyboard.press("s");
    const input = page.locator("[role=dialog] [role=combobox]");
    await input.waitFor();
    assert.equal(await focusedRole(page), "combobox");
    const {results, listbox} = await typeAndWait(page, input, "Boston");
    await page.keyboard.press("ArrowDown");
    // Escape closes the suggestions first, the panel only on a second press
    await page.keyboard.press("Escape");
    assert.ok(await listbox.isHidden());
    assert.equal(await page.locator("[role=dialog]").count(), 1, "the panel stays open");
    assert.equal(await input.inputValue(), "Boston");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.waitForURL(`${BASE}${href(results[1])}`, {timeout: NAV_TIMEOUT});
    await page.close();
  });

  test("8b. Home and End stay text editing keys; Escape twice closes the navigation's panel", async () => {
    const page = await open("/about/background");
    await page.keyboard.press("s");
    const input = page.locator("[role=dialog] [role=combobox]");
    const {listbox} = await typeAndWait(page, input, "jo");
    await page.keyboard.press("ArrowDown");
    const highlighted = await activeId(input);
    // the box leaves Home and End to the browser (on macOS they scroll the page; elsewhere they
    // move the caret): it neither cancels them nor moves the highlight
    await page.evaluate(() => {
      window.__prevented = [];
      window.addEventListener("keydown", e => { if (e.key === "Home" || e.key === "End") window.__prevented.push(e.defaultPrevented); });
    });
    await page.keyboard.press("Home");
    await page.keyboard.press("End");
    assert.deepEqual(await page.evaluate(() => window.__prevented), [false, false]);
    assert.equal(await activeId(input), highlighted);
    assert.ok(await listbox.isVisible());
    // and the platform's own line start and end keys edit the text as usual
    const [start, end] = process.platform === "darwin" ? ["Meta+ArrowLeft", "Meta+ArrowRight"] : ["Home", "End"];
    await page.keyboard.press(start);
    assert.equal(await input.evaluate(el => el.selectionStart), 0);
    await page.keyboard.press(end);
    assert.equal(await input.evaluate(el => el.selectionStart), 2);
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("[role=dialog]").count(), 0);
    await page.close();
  });

  test("Enter with nothing highlighted: the search page when there is a Search button, the first suggestion when not", async () => {
    const page = await open("/reports");
    await typeAndWait(page, mainBox(page), "jo");
    await page.keyboard.press("Enter");
    await page.waitForURL(u => new URL(u).pathname === "/search", {timeout: NAV_TIMEOUT});
    await page.close();

    const landing = await open("/locations");
    const {results} = await typeAndWait(landing, mainBox(landing), "bost");
    await landing.keyboard.press("Enter");
    await landing.waitForURL(`${BASE}${href(results[0])}`, {timeout: NAV_TIMEOUT});
    await landing.close();
  });

  test("a press outside the box closes the list; a click in the box brings it back", async () => {
    const page = await open("/reports");
    const input = mainBox(page);
    const {listbox} = await typeAndWait(page, input, "jo");
    await page.mouse.click(5, 700);
    assert.ok(await listbox.isHidden());
    assert.equal(await input.inputValue(), "jo");
    await input.click();
    await listbox.waitFor();
    await page.close();
  });

  test("on a phone the list stays inside the window", async () => {
    const page = await open("/locations", {width: 390, height: 640});
    const input = mainBox(page);
    const {listbox} = await typeAndWait(page, input, "san");
    const [box, inputBox] = await Promise.all([listbox.boundingBox(), input.boundingBox()]);
    assert.ok(box.y + box.height <= 640, "the list ends inside the window");
    assert.ok(Math.abs(box.x - inputBox.x) <= 2 && Math.abs(box.width - inputBox.width) <= 3, "the list lines up with the input");
    await page.close();
  });
});
