---
layout: post
title: Starting with LLM? Think hard, start small, iterate fast. Time is all you need.
author: Ondrej Platek
tags: LLM, research, Math, Education, BottleCap AI, nanoGPT, pretraining, RL, getting started
---

David — who literally helped make [SpaceX](https://www.linkedin.com/in/davidpav/) rockets fly — asked me for a favour: _"Explain to kids from [Matika Cesku](https://www.linkedin.com/company/matika-cesku/) what BottleCap AI does and what you do as an LLM researcher, in plain words."_ I was hooked. Immediately. I'm a fan.

I'm a fan of Mathematics, Teaching and, of course, LLM research.
Here are my resources, and they double as my updated recommendation for **any motivated person who wants to start LLM research today.** 🚀

# My personal advice 

- **Hard empirical evidence is the key.** Math and logic give you the intuition; the experiments tell you whether your intuition was right. You need hundreds experiments. Have hunderds of different reality checks instead of three. Quantity of valid experiments matters.
- **To go fast, start small.** As a beginner you have almost no hardware, which forces you to **spend your thinking on the most interesting parts** instead of babysitting a giant run. Use it to your advantage and trust that it scales. Spend most time at designing experiments to give you the most informative and conclusive findings.
- **Finally, when you trust your improvements** it is time to scale. Find a place that will scale your research. I found BottleCap AI.


## The map: two parts, pretraining and post-training

If you remember one thing about how modern LLMs are built, remember that there are **two main parts**, and they have completely different flavours.

### 1. Pretraining — the math-motivated part

This is where the model learns to predict the next token over a huge pile of text. The objective is rooted in an elegant field of information theory: language modeling is literally just minimizing **cross-entropy**.

Good news for beginners: **pretraining can be done efficiently and small.** This is exactly where the 20-minute loop lives. See modded-nanogpt link below.

### 2. Post-training — the hacky part

This is where the model learns to be _useful_ — to follow instructions, to reason, to behave. It follows the **theory of reinforcement learning**, but in practice it is far more **hacky and empirical** than pretraining. The theory points the direction; taste and experiments do the rest. It is a different muscle, and just as fun.

Take-home: _pretraining is math, post-training is RL-flavoured craft._

## My recommended starting resources

Here is the path I actually recommend — the same one I gave my friend.

**Build the foundations with Andrej Karpathy.** My favourite intro to neural networks and then to LLMs, full stop:

- ▶️ [Karpathy — Neural Networks: Zero to Hero](https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ)

**Understand the architecture that started it all.** The paper of the century — _Attention Is All You Need_ — explained very nicely by another hero, Yannic Kilcher:

- ▶️ [Yannic Kilcher — the Transformer paper](https://youtu.be/iDulhoQ2pro?si=ASXAk6Gjgc7uhWDv)

**Get your hands dirty.** A great hands-on start, small enough to run and iterate fast:

- 💻 [karpathy/nanoGPT](https://github.com/karpathy/nanoGPT)

**Then chase speed.** There is an ultra-fast fork that turns training into a sport:

- ⚡ [KellerJordan/modded-nanogpt](https://github.com/KellerJordan/modded-nanogpt)

…and that speed-running culture is literally our entrance hiring test at BottleCap AI:

- 🧪 [BottleCapAI/NoCap-Test](https://github.com/BottleCapAI/NoCap-Test) — **feel free to try it.** The 20-minute loop is real; go see your first result.

## Where to actually run it — for free or nearly free

Remember the whole point: **no GPU at home.** Here is where the 20-minute loop lives without buying any hardware.

**Free notebooks with a GPU attached:**

- 📓 [Google Colab](https://colab.research.google.com/) — free GPU runtimes, zero setup, perfect for your first nanoGPT run.
- 📓 [Kaggle Notebooks](https://www.kaggle.com/code) — free weekly GPU/TPU quota and a generous community.
- 🤗 [Hugging Face Spaces](https://huggingface.co/spaces) — host and share your model and demos; literally showcases of the newest science.

**Cheap hosted inference (when you just want to _use_ a model, not train one):**

- 🟢 [NVIDIA build (NIM APIs)](https://build.nvidia.com/) — a large catalogue of models behind a very cheap inference API, with free credits to get going.
- 🔀 [OpenRouter](https://openrouter.ai/) — one API key, hundreds of models, pay-as-you-go. Great for comparing models without juggling accounts.

**An agentic coding sidekick to move faster:**

- 🤖 [Pi coding agent](https://pi.dev/) ([source](https://github.com/badlogic/pi-mono)) — a minimal, fully hackable terminal agent you extend in TypeScript.
- 🤖 [OpenCode](https://opencode.ai/) — open-source terminal coding agent that works with 75+ providers (including OpenRouter above).

Pick one, point it at your nanoGPT checkout, and let it handle the boilerplate while you think about the interesting parts.

For reinforcement learning, I do not know of any practical setup that directly scales to SOTA research, so I can only recommend two resources:
- Nice but very general introduction to Reinforcement Learning by [Sutton & Barto: Introduction to Reinforcement Learning](https://web.stanford.edu/class/psych209/Readings/SuttonBartoIPRLBook2ndEd.pdf),
- [Sebastian Raschka's blog about LLMs](https://sebastianraschka.com/blog/) — lately, all published models were trained by an algorithm at least inspired by reinforcement learning.

## What does BottleCap do?
_The very first question I was asked_

We are working hard on speedups for training as well as inference.
We also ship products:

- 🔎 [**AI Scan**](https://scan.bottlecapai.com/) — _AI models are manipulated. We reveal how._ It detects post-training modifications — opinion steering, topic avoidance, sensitivity filters — and lets you compare shift-evaluation reports across 25+ models. A perfect playground for the "post-training is hacky" lesson above.
- 📱 [**Pulse**](https://www.bottlecapai.com/pulse-app) — community news powered by our own efficiency-first model CAP1. Cut signal from noise in real time. Grab it on [iOS](https://apps.apple.com/us/app/id6753948492) or [Android](https://play.google.com/store/apps/details?id=com.bottlecapai.pulse).
- 🧪 We hire smart engineers and have fun. Improve LLM pretraining and join us! **[try the BottleCapAI/NoCap-Test](https://github.com/BottleCapAI/NoCap-Test)**.


To conclude: start small, go fast, and let the empirical evidence sharpen your intuition. And if you're stuck, reach out to people — or Claude Code, or Codex. Most importantly, have fun with fellow humans.


[Reach out — let's research LLMs together. :) ➔](https://www.linkedin.com/in/ondrejplatek/)
