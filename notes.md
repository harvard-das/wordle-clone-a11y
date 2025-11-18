
## Non-accessibility to-dos

- ✅ Create method of creating game with selected word
- ✅ Fix Delete key (add pointer-events: none to SVG)
- ✅ Fix keyboard input (Firefox find-in-page triggered)
- ✅ Fix ignoring keys pressed with modifier keys (e.g. Cmd+R)
- Stretch: support prefers-color-scheme

## Accessibility to-dos

- ✅ Use of Color
- ✅ Color contrast
- ✅ Fix hover, focus
- ✅ Name delete key
- ✅ Live region feedback
- ✅ Add status to keys
- Stretch: grid role for keyboard

What official Wordle says:

After word is Entered:

- 1st letter, a, absent
- 2nd letter, b, correct
- 3rd letter, c, present in another position
- 4th letter, d, absent
- 5th letter, e, absent


When a keyboard letter is focused:

- add i, button
- i correct, button
- i present, button


Current repo text color: white
Current repo background colors:

- unused hsl(  200,  1%, 51% ), contrast 3.8:1
- absent hsl(240, 2%, 23%), contrast 11.4:1
- present/wrong-location hsl(49, 51%, 47%), contrast 2.6:1
- correct hsl(115, 29%, 43%), contrast 4:1

present vs. absent, contrast 4.3:1
present vs. correct, contrast 1.5:1
absent vs. correct, contrast 2.9:1
unused vs. absent, contrast 2.983:1

hover, focus add a `--lightness-offset: 10%` to the keys

Change to:

- unused hsl(200, 1%, 45%), contrast 4.8:1
- absent hsl(240, 2%, 15%), 15.2:1
- present/wrong-location hsl(49, 51%, 34%), contrast 4.7:1
- correct hsl(115, 29%, 39%), contrast: 4.7:1

present vs. absent, contrast 3.2:1 plus border difference
present vs. correct, contrast 1.1:1 plus border difference
absent vs. correct, contrast 3.3:1 plus border difference
unused vs. absent, contrast 3.2:1

