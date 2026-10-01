# Vizuální podklady

`img/chapel-cutout.png` obsahuje kapličku z obrázku `kaplicka.png`, který
uživatel dodal 1. října 2026. Výřez bez nápisu a pozadí byl připraven
vestavěným nástrojem ImageGen. [Použité zadání](logo-prompt.txt) popisuje
zachování architektury a průhledných otvorů.
Hlavičky a patičky používají alfa kanál výřezu jako CSS masku a přebírají
zelenou barvu aktuálního motivu. Stejný PNG soubor slouží jako ikona webu.

Písmo Geist a Geist Mono pochází ze stejné lokální sady jako projekt
`obecni-web`. Licenční podmínky SIL Open Font License jsou v `fonts/LICENSE.txt`.
Písma se načítají z tohoto webu, bez externí služby.

`img/relief-vysker-light.png` a `img/relief-vysker-dark.png` jsou převzaté
z `obecni-web/public/images`. Jde o ilustrace vytvořené pro tento projekt,
se stylizovanou Hůrou, kaplí sv. Anny a vesnicí. Nejde o zaměřený model terénu.
Podrobnosti jejich původu jsou v `obecni-web/design/02-vysker-relief/README.md`.

Filtr `img/relief-accent.svg` mění fialovou cestu na zelenou přímo při
vykreslení. Zachovává původní průhlednost, neutrální terén a teplá světla oken.
CSS vybírá podle motivu pouze jeden reliéf.

Při změně `css/style.css` aktualizujte také parametr `v` v odkazech na styl
ve všech HTML stránkách, aby prohlížeče načetly odpovídající verzi.
