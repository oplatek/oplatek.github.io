---
layout: post
title: You don't need a GPU to start LLM research. Just 20 minutes and a math brain.
author: Ondrej Platek
tags: LLM, research, Math, Education, BottleCap AI, nanoGPT, pretraining, RL, getting started
---

A [friend from SpaceX](https://www.linkedin.com/in/davidpav/) asked me for a favour: _"Explain to me what BottleCap AI does. In plain words."_

He is the kind of person I instantly like — a fan of Mathematics, of rockets, and of teaching.
So I owed him a good answer. Here it is, and it doubles as my updated recommendation for **any motivated person who wants to start LLM research today.** 🚀

## What BottleCap AI does, and why it exists

The cleanest pitch I have ever heard came from [Míša Pavlík](https://www.linkedin.com/in/michaelapavlik/) and her **Matika AI** — math for kids who do it _in their free time_, for fun, led by a charismatic teacher backed by AI.
I was sold in 10 seconds. Míša organized the whole thing in under 10 minutes.

That speed is not an accident — it _is_ the point.

I do LLM research for the same reason Matika AI exists: because the most interesting machinery in the world right now should be reachable by curious people who like to think.
Kids who do math in their free time are exactly the audience. They already have the one thing that matters most: **intuition built from logic and hard empirical evidence.**

## The key ingredient I almost forgot to tell people

Talking to my SpaceX friend pushed me to update my own intro materials, because I had buried the lede. Here it is:

> **You do not need a GPU at home. You do not even need to wait long to see your first result.**

The iteration time of a real experiment can be **~20 minutes**. That changes everything.

Why does it matter so much for someone coming from math?

- **Hard empirical evidence is the key.** Math and logic give you the intuition; the experiment tells you whether your intuition was right. Twenty minutes per round means you get hundreds of those reality checks instead of three.
- **Iteration speed is _the_ advice for success.** Not cleverness, not hardware — speed. The faster you close the loop, the faster you learn.
- **To go fast, start small.** And this is the beautiful trap: as a beginner with little hardware, you are _forced_ to be fast, which forces you to be small, which forces you to **spend your thinking on the most interesting parts** instead of babysitting a giant run.

Constraints are a feature. Embrace them.

## The map: two parts, pretraining and post-training

If you remember one thing about how modern LLMs are built, remember that there are **two main parts**, and they have completely different flavours.

### 1. Pretraining — the math-motivated part

This is where the model learns to predict the next token over a huge pile of text. The objective is beautifully mathematical: it is all about **entropy and cross-entropy.** If you enjoy information theory, this is your home turf — minimizing cross-entropy _is_ the whole game, and the intuition transfers directly.

Good news for beginners: **pretraining can be done efficiently and small.** This is exactly where the 20-minute loop lives.

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

## What BottleCap AI ships (and you can poke at today)

We don't just talk efficiency — we ship it. Two things worth your attention:

- 🔎 [**AI Scan**](https://scan.bottlecapai.com/) — _AI models are manipulated. We reveal how._ It detects post-training modifications — opinion steering, topic avoidance, sensitivity filters — and lets you compare shift-evaluation reports across 25+ models. A perfect playground for the "post-training is hacky" lesson above.
- 📱 [**Pulse**](https://www.bottlecapai.com/pulse-app) — community news powered by our own efficiency-first model CAP1. Cut signal from noise in real time. Grab it on [iOS](https://apps.apple.com/us/app/id6753948492) or [Android](https://play.google.com/store/apps/details?id=com.bottlecapai.pulse).

## So, should you start?

If you are motivated, if you like math, rockets, or teaching — yes.
You don't need a GPU farm. You don't need permission. You need curiosity, a small model, and twenty minutes.

Start small. Go fast. Let the empirical evidence sharpen your intuition.

And when you are ready to prove it: 🧪 **[try the BottleCapAI/NoCap-Test](https://github.com/BottleCapAI/NoCap-Test)** — our entrance hiring test, and the most honest 20-minute introduction to what this work feels like.

[Reach out — let's research LLMs together. ➔](https://www.linkedin.com/in/ondrejplatek/)
