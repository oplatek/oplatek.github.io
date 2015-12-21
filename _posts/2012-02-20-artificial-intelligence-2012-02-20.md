---
layout: post
title: Artificial Intelligence 2012-02-20
author: Ondrej Platek
tags:
- Mff
- School
- Artificial Intelligence
---

- Weak AI - solving hard problems. State of art.
- AI - a machine can understand problems. (Classical problem of Chinese room) 

**How to cope with uncertainty?**

- Act as in **believe state**. 
- We eliminated some states by performing actions.
- Big problem of large number <strong>of n states</strong>. 
- Trying can explore actions by going to <strong> 2^n</strong> (I can use 2 actions from one state)
- Apriorni pravděpodobnost (?aprior probability?) -- unconditional probability
- soucinovy pravidlo (Chain rule))$ P(a \wedge b) = P(a|b)*P(b)$
- <strong>Příklad</strong>:  $ P(Cavity|toothache) = \alpha $        
- Nezavislost nam umoznuje ukladat mensi tabulky pro vypocet marginalni pravdepodobnosti.
- Podminena nezavislost je castejsi a take setri $ P(X|Y,Z) = P(X|Y)*P(X|Z)$ vypocet
