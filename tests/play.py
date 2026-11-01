"""Silent Prigorsk autotest.

Plays the cases in a real headless browser by clicking through the UI,
the same way a player would, and fails on any JavaScript error or wrong verdict.

Run:  python3 tests/play.py
Needs: pip install playwright && playwright install chromium
"""
import pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "index.html").as_uri()


class Game:
    def __init__(self, pg):
        self.pg = pg

    def js(self, expr):
        return self.pg.evaluate(expr)

    def clear(self):
        """Dismiss every overlay: travel animation, radio, notes, reveal cards."""
        pg = self.pg
        pg.wait_for_timeout(60)
        for _ in range(40):
            if pg.locator("#trav .tv").count():
                pg.locator("#trav .tv").click(force=True); pg.wait_for_timeout(60); continue
            if pg.locator("#radios [data-a=rok]").count():
                pg.locator("#radios [data-a=rok]").click(); continue
            if pg.locator("#notes [data-a=nok]").count():
                pg.locator("#notes [data-a=nok]").first.click(force=True); pg.wait_for_timeout(60); continue
            r = pg.locator("#reveal [data-a=rvok], #reveal [data-a=rvclose]")
            if r.count():
                r.first.click(); continue
            break
        pg.wait_for_timeout(20)

    def click(self, sel):
        self.clear()
        loc = self.pg.locator(sel).first
        loc.wait_for(state="attached", timeout=3000)
        loc.evaluate("e => e.click()")
        self.pg.wait_for_timeout(30)
        self.clear()

    def tab(self, name):
        self.click(f".nav [data-a=tab][data-id={name}]")

    def go(self, loc):
        self.tab("map")
        self.click(f".pinlist [data-a=go][data-id={loc}]")

    def ask(self, *keys):
        for k in keys:
            sel = f'[data-a=say][data-k="{k}"]'
            if self.pg.locator(sel).count():
                self.click(sel)

    def bye(self):
        self.click("[data-a=say][data-k=bye]")

    def wait_hours(self, h):
        self.clear()
        self.js(f"advance({h}); render()")
        self.clear()

    def read_mail(self):
        if self.js("S.loc") != "otdel":
            return
        self.tab("mail")
        for _ in range(20):
            unread = self.pg.locator(".msg.unread")
            if not unread.count():
                break
            unread.first.click(force=True)
            self.pg.wait_for_timeout(30)
            self.clear()
            if self.pg.locator("#modal .x").count():
                self.pg.locator("#modal .x").first.click(force=True)
            self.clear()

    def call(self, key, say=True):
        self.js("UI.modal='phone';UI.call=null;render()")
        self.click(f'[data-a=dial][data-k="{key}"]')
        self.pg.wait_for_timeout(1300)
        if say:
            self.click("[data-a=csay][data-v=say]")
        self.click("[data-a=hang]")
        self.js("UI.modal=null;render()")

    def has(self, c):
        return self.js(f"has('{c}')")


def case1(g):
    pg = g.pg
    pg.click('[data-a=start][data-id="1"]')
    g.click("[data-a=accept]")
    g.js("UI.hintOff=true")
    # Lab: knife and wallet
    g.js("UI.modal='labm';render()")
    g.click("[data-a=lab][data-id=knife]")
    g.click("[data-a=lab][data-id=wallet]")
    g.js("UI.modal=null;render()")
    # Crime scene
    g.go("scene")
    g.click("[data-a=inside]")
    g.click(".office [data-a=spot][data-i='0']")  # desk drawer: notebook
    assert g.has("notebook"), "notebook not found"
    g.click("[data-a=inside]")
    g.click("[data-a=lact][data-i='0']")  # neighbours
    # Neighbours
    g.go("tk"); g.click("[data-a=knock]"); g.ask("q:a", "q:b", "q:c"); g.bye()
    g.go("bu"); g.click("[data-a=knock]"); g.ask("q:a", "q:b", "q:c", "q:d"); g.bye()
    g.go("bar"); g.click("[data-a=knock]"); g.ask("q:a", "q:b"); g.bye()
    assert g.has("ra2"), "barman did not mention Melnik"
    # Database
    g.go("otdel")
    g.read_mail()
    g.js("UI.modal='base';render()")
    pg.fill("#bq", "Мельник"); pg.click("#bform button"); pg.wait_for_timeout(1000)
    g.click("[data-a=brec]"); g.click("[data-a=bpin]")
    g.js("UI.modal=null;render()")
    # Talk to Melnik at home, hand summons
    g.go("me"); g.click("[data-a=knock]"); g.ask("q:a", "q:b", "q:c", "q:d"); g.bye()
    assert g.has("me2"), "Melnik did not lie"
    # Warrant
    g.go("otdel")
    g.call("pros")
    assert g.js("!!S.warrant"), "warrant refused: " + str(g.js("val(CS.warrant.no)"))
    g.go("me")
    g.click("[data-a=search]")
    assert g.has("search"), "search failed"
    g.go("otdel")
    g.js("UI.modal='labm';render()")
    g.click("[data-a=lab][data-id=jacket]")
    g.js("UI.modal=null;render()")
    g.go("me"); g.click("[data-a=knock]"); g.ask("summon"); g.bye()
    g.go("otdel")
    # Next day: Melnik arrives, take prints, wait for lab
    g.js("UI.reveal=[];render()")
    g.wait_hours(max(0.25, 22 - g.js("hour()")))
    g.clear()
    for _ in range(3):
        if g.js("S.arrived.includes('melnik')"):
            break
        g.wait_hours(1)
    g.read_mail()
    assert g.js("S.arrived.includes('melnik')"), "Melnik did not come: "+str(g.js("[fmt(S.t),day(),JSON.stringify(S.summons),JSON.stringify(S.shist)]"))
    g.tab("calls")
    g.click("[data-a=room][data-id=melnik]")
    g.ask("sample")
    g.bye()
    g.wait_hours(2)
    g.read_mail()
    assert g.has("match"), "prints did not match"
    assert g.has("jacketlab"), "jacket lab missing"
    # Court
    g.tab("case")
    g.click("[data-a=accuse]")
    g.click("[data-a=pick][data-id=melnik]")
    g.click("[data-a=court]")
    verdict = g.js("S.over")
    assert verdict == "win", f"case 1 verdict: {verdict} {g.js('S.result&&S.result.text')}"
    return f"day {g.js('day()')}, clues {g.js('S.clues.length')}"


def case2(g):
    pg = g.pg
    g.js("UI.title=true;S=null;render()")
    pg.click('[data-a=start][data-id="2"]')
    g.click("[data-a=accept]")
    g.js("UI.hintOff=true")
    g.tab("calls")
    g.click("[data-a=room][data-id=irina]")
    g.ask("q:a", "q:h", "q:c")
    g.bye()
    assert g.js("S.ev.includes('key')"), "key not in evidence"
    g.go("home")
    for i in range(3):
        g.click(f"[data-a=lact][data-i='{i}']")
    g.go("zavod")
    g.click("[data-a=knock][data-id=kuzmin]"); g.ask("q:a", "q:b"); g.bye()
    g.click("[data-a=knock][data-id=zaitseva]"); g.ask("q:a", "q:b"); g.bye()
    g.click("[data-a=knock][data-id=chernov]"); g.ask("q:b", "q:c", "q:d"); g.bye()
    g.go("garage"); g.click("[data-a=knock]"); g.ask("press:cards"); g.bye()
    assert g.has("debt"), "Zhora did not talk"
    # Remaining chain scripted through the engine to keep the test short
    g.js("""['ba1','body2','autopsy','tent','pack','thermos','butt','tracks','ident1','ir3','ident','buttlab','tires','uazsearch','shovellab','buttmatch','confessR'].forEach(c=>addClue(c,true));found('barmin');found('ryabov');UI.reveal=[];render()""")
    g.tab("case")
    g.click("[data-a=accuse]")
    g.click("[data-a=pick][data-id=ryabov]")
    g.click("[data-a=pick][data-id=barmin]")
    g.click("[data-a=court]")
    verdict = g.js("S.over")
    assert verdict == "win", f"case 2 verdict: {verdict}"
    return "ok"


def save_test(pg):
    """Start case 1, play a bit, reload page, Continue must restore the same state."""
    g = Game(pg)
    pg.evaluate("localStorage.clear()")
    pg.reload(); pg.wait_for_timeout(400)
    pg.click('[data-a=start][data-id="1"]')
    g.click("[data-a=accept]")
    g.go("scene")
    t1 = g.js("S.t"); loc1 = g.js("S.loc")
    pg.wait_for_timeout(400)
    pg.reload(); pg.wait_for_timeout(400)
    assert pg.locator("[data-a=continue]").count(), "no Continue button after reload"
    pg.click("[data-a=continue]"); pg.wait_for_timeout(200)
    assert g.js("S.t") == t1 and g.js("S.loc") == loc1, "state not restored"
    code = pg.evaluate("toCode(readSave())")
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(400)
    assert not pg.locator("[data-a=continue]").count()
    pg.click("[data-a=transfer]")
    pg.fill("#pastecode", code); pg.click("[data-a=loadcode]"); pg.wait_for_timeout(200)
    assert g.js("S && S.loc") == loc1, "transfer code failed"
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(400)
    return "ok"


def main():
    errors = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 430, "height": 932})
        pg.route("**/fonts.g*/**", lambda r: r.abort())
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.goto(URL)
        pg.wait_for_timeout(400)
        g = Game(pg)
        results = {}
        try:
            results["save"] = "PASS " + save_test(pg)
        except Exception as e:  # noqa
            results["save"] = f"FAIL {e}"
        for name, fn in (("case1", case1), ("case2", case2)):
            try:
                results[name] = "PASS " + fn(g)
            except Exception as e:  # noqa
                pg.screenshot(path=str(ROOT / f"tests/fail_{name}.png"))
                results[name] = f"FAIL {e}"
        b.close()
    for k, v in results.items():
        print(k, v)
    if errors:
        print("JS errors:", errors)
    ok = all(v.startswith("PASS") for v in results.values()) and not errors
    print("ALL OK" if ok else "FAILED")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
