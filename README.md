# Silent Prigorsk / Тихий Пригорск

A detective game about an investigator in a small provincial town in the 90s.
Детективная игра про следователя в провинции 90-х.

**Play:** https://rimiko-games.github.io/silent-prigorsk/

Works in any browser: phone, tablet, PC, Mac. On iPhone: Safari → Share → Add to Home Screen.

## Structure

```
index.html            page skeleton, loads everything below
css/style.css         interface look: colors, layout, cards
js/core.js            helpers, shared characters (Gavrilov, Vetrova, Lapteva), drawings
cases/case1.js        Case 1 "Murder in Zolotukhino" (pure data)
cases/case2.js        Case 2 "The Missing Man" (pure data)
js/engine.js          rules: time, mail, lab, summons, rollover, radio
js/ui.js              screens: office, map, case file, dialogs, phone, cards
js/actions.js         travel, dialogs, court, clicks, startup
js/save.js            autosave, Continue, transfer code
js/keys.js            keyboard on PC: 1–9, Enter, Esc
img/  audio/          pictures and music
tests/play.py         autotest: plays both cases to the verdict, on a phone and on a PC screen
docs/RULES.md         all game mechanics in one place
```

Load order matters: core → cases → engine → ui → actions → save → keys.

Layout: phone below 1000 px wide; PC and tablet from 1000 px (menu on the left, evidence board on the case tab); side panel from 1280 px.

## Adding a case

1. Copy `cases/case2.js` to `cases/case3.js`, set `CASES[3]={id:3,...}`.
2. Add `<script src="cases/case3.js"></script>` to `index.html` after the other cases.
3. Put its pictures into `img/`.
4. Add a playthrough to `tests/play.py` and run `python3 tests/play.py`.

## Test

```
pip install playwright && playwright install chromium
python3 tests/play.py
```
