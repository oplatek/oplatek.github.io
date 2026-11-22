---
layout: page
title: Recall — flashcard decks
---

Flashcard decks for **Recall**, a small spaced-repetition app for iPhone.
Each deck is one plain Markdown file: readable here, importable in the app, and easy for a person or an LLM to write.

**Add a deck in the app:** tap **+** → *Add from Web*. The list below loads by itself
(it is [`decks.md`](decks.md)). A deck added this way can later be refreshed with *Check for Updates* on its page.

| Deck | Cards | About |
|---|---|---|
| [DPO — Direct Preference Optimization](dpo.md) | 34 | Rafailov et al., 2023. Preference alignment without RL — derivation, loss, gradient, practice, and the variants (IPO, cDPO, SimPO, ORPO, KTO). |
| [GRPO — Group Relative Policy Optimization](grpo.md) | 35 | Shao et al., 2024 (DeepSeekMath) and DeepSeek-R1. Critic-free PPO with group-normalized advantages — objective, KL estimator, supervision types, findings, and the fixes (Dr. GRPO, DAPO, GSPO). |
| [DPO vs GRPO](dpo-vs-grpo.md) | 13 | Side-by-side questions that force you to tell the two apart — signal, data, models, β, cost, failure modes, and when to use which. |
| [Přijímačky na 8leté gymnázium — matematika (typy úloh)](prijimacky-m5.md) | 35 | Vlastní úlohy stejných typů, jaké bývají v testu CERMAT z matematiky pro 8letá gymnázia (M5): pořadí operací, jednotky, zlomky, slovní úlohy, číselné hádanky, geometrie, rýsování a pravidla testu. Úlohy z testů CERMAT zde nejsou, jen odkaz na ně. |
| [Přijímačky na 8leté gymnázium — čeština (typy úloh)](prijimacky-c5.md) | 35 | Typy úloh z testu CERMAT z češtiny pro 5. třídu (C5, přijímačky na osmiletá gymnázia): pravopis, tvary slov, slovní druhy, větné členy, význam slov, práce s textem a strategie. Všechny věty jsou vlastní, ne z testů; typy úloh podle testů C5A 2025, C5A 2026 (1. termín) a C5B 2026 (2. termín). |

## Write your own deck

```
# Deck name

id: my-deck
version: 1
summary: One line about the deck.

### my-deck-001 | tag
Q: The question.
A: The answer, short.
N: Optional notes, a source link.
```

Save it as `my-deck.md` and open it with Recall (AirDrop, Files, Mail), or paste it with **+** → *Paste Deck*.
That screen also has *Copy Prompt*: paste it into the Claude or Gemini app together with photos of your notes,
and paste the reply back into Recall. Raise `version` whenever you change a deck, and never change a card's id:
progress is stored per card id.

## Sources

- The DPO and GRPO decks are written from the papers: Rafailov et al. 2023 (`arxiv.org/abs/2305.18290`) and
  Shao et al. 2024 (`arxiv.org/abs/2402.03300`), with DeepSeek-R1 and the follow-up work cited on each card.
- The *Přijímačky* decks contain original practice tasks of the same types as the CERMAT entrance tests. The official
  tests, keys and worked solutions are copyrighted and are not copied here; they are free to download from
  [prijimacky.cermat.gov.cz](https://prijimacky.cermat.gov.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf.html).
