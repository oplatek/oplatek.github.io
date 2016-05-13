Status Bar
==========
Napište dva skripty status_bar.sh a (pomocný) test.sh, které demonstrují možnost, jak zobrazovat uživateli stav průběhu skriptu.

test.sh 
-------
Pomocný skript test.sh slouží jako vzorový shell-skript, jehož průběh chceme monitorovat. Jeho úkolem je každou vteřinu vypsat na svůj standardní výstup číslo (od jedné do deseti) a potom skončit. Skript test.sh tedy po spuštění vypíše na stdout 1 (a odřádkování), vteřinu počká (pomocí sleep 1;), vypíše 2 (a odřádkování), opět vteřinu počká atd.

status_bar.sh
-------------
Skript status_bar.sh dostane jako jediný argument název jiného shell-skriptu, který má spustit a jehož průběh má zároveň monitorovat. Jeho spuštění vypadá tedy například takto: 
`sh status_bar.sh test.sh.` 
Tímto příkazem říkáme skriptu status_bar.sh, aby spustil skript test.sh a vypisoval nám přitom informace o tom, jak rychle postupuje jeho zpracování. Po zadání tohoto příkazu vypíše na stdout text:
`PROGRESS of ’test.sh’ : [          ]`

který má mezi hranatými závorkami 10 mezer a nekončí odřádkováním. 
Zároveň spustí skript, jehož jméno dostal jako první (a jediný) parametr (v našem případě to bude test.sh a čte jeho standardní výstup. Pokaždé, když sledovaný skript test.sh vypíše
1 na svůj stdout řádku s číslem, připíše status_bar.sh do vypsané řádky pomlčku mezi hranaté závorky. Když vypíše desátou pomlčku, skončí. 

Přepisování už jednou vypsané řádky (tj. přepsání mezer mezi hranatými závorkami pomlčkami) je možné díky znaku carriage return (`\r`), který instruuje terminál, aby přesunul kurzor na záčátek právě vypsané řádky. 

Například příkaz:
`printf ’Ahoj, Franto, jak se mas?\rAhoj, Lojzo, \n’`
vypíše text:
`Ahoj, Lojzo, jak se mas?`


Příkaz:
`printf ’UNIX je nejlepsi \rUNIX je ’; sleep 1; printf "tak akorat pro ufony\n"`
potom udělá to, že vypíše UNIX je nejlepsi a o vteřinu později to přepíše na UNIX je tak akorat pro ufony a odřádkuje.
